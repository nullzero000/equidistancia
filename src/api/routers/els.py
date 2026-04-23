"""ELS search router — SSE streaming endpoints.

/els/search event sequence:
  event: estimate   data: {"expected": <int>}
  event: match      data: {"skip": <int>, "start": <int>, "indices": [...],
                            "verses": [{"book": ..., "chapter": ..., "verse": ...}]}
  ...
  event: done       data: {"total_found": <int>}

/els/test event sequence:
  event: estimate   data: {"n_iterations": <int>, "eta_ms": <int>}
  event: progress   data: {"iteration": <int>, "total": <int>}
  ...
  event: result     data: {"observed_count": <int>, "null_mean": <float>,
                            "null_std": <float>, "z_score": <float>, "p_value": <float>}
"""
import asyncio
import json
import re
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from math import prod
from typing import AsyncIterator, Iterator

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from src.logic.corpus.builder import locate
from src.logic.corpus.encoding import encode
from src.logic.els.search import ELSResult, els_search
from src.logic.stats.null_models import NullModel
import src.api.state as state

# Benchmark medians from Sprint 7a (ms per iteration on full 1.2M motor).
_ITER_MS: dict[NullModel, int] = {
    NullModel.LETTER_SHUFFLE: 17,
    NullModel.BIGRAM_MARKOV:  22,
}

router = APIRouter()

_HEBREW_CONSONANTS = re.compile(r"^[א-ת]{2,20}$")
_VALID_STREAMS = {"ketiv", "qere"}


def _validate_target(target: str) -> None:
    if not _HEBREW_CONSONANTS.match(target):
        raise HTTPException(
            status_code=422,
            detail="target must be 2–20 Hebrew consonants (Unicode block 0x05D0–0x05EA)",
        )


def _expected_matches(motor: bytes, target: str, skip_range: range) -> int:
    """Frequency-based estimator for total ELS matches across skip_range.

    Uses letter-index bytes for both motor and target (Counter over bytes
    yields int keys, encode(target) yields matching int keys).
    """
    n = len(motor)
    if n == 0:
        return 0
    freqs = Counter(motor)
    target_bytes = encode(target)
    p = prod(freqs.get(b, 0) / n for b in target_bytes)
    return int(n * p * len(skip_range))


def _verse_refs(result: ELSResult, offset_map) -> list[dict]:
    refs = []
    seen: set[tuple] = set()
    for idx in result.indices:
        try:
            w = locate(offset_map, idx)
            key = (w.book_en, w.chapter, w.verse)
            if key not in seen:
                seen.add(key)
                refs.append({"book": w.book_en, "chapter": w.chapter, "verse": w.verse})
        except IndexError:
            pass
    return refs


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _stream(
    motor: bytes,
    offset_map,
    target: str,
    skip_range: range,
    book_filter: str,
    limit: int,
) -> Iterator[str]:
    expected = _expected_matches(motor, target, skip_range)
    yield _sse_event("estimate", {"expected": expected})

    total = 0
    for result in els_search(motor, target, skip_range):
        if limit and total >= limit:
            break

        if book_filter:
            try:
                w = locate(offset_map, result.start)
                if book_filter.lower() not in w.book_en.lower():
                    continue
            except IndexError:
                continue

        total += 1
        yield _sse_event("match", {
            "skip": result.skip,
            "start": result.start,
            "indices": list(result.indices),
            "verses": _verse_refs(result, offset_map),
        })

    yield _sse_event("done", {"total_found": total})


@router.get("/search", summary="ELS search — SSE stream")
def els_search_endpoint(
    target: str = Query(..., description="Hebrew consonants, 2–20 chars"),
    skip_min: int = Query(2, ge=2, le=10000),
    skip_max: int = Query(..., ge=2, le=10000),
    book: str = Query("", description="Book name substring filter (optional)"),
    limit: int = Query(100, ge=1, le=10000),
    stream: str = Query("ketiv", description="Corpus stream: ketiv or qere"),
):
    _validate_target(target)
    if skip_min > skip_max:
        raise HTTPException(status_code=422, detail="skip_min must be ≤ skip_max")
    if stream not in _VALID_STREAMS:
        raise HTTPException(status_code=422, detail=f"stream must be one of {sorted(_VALID_STREAMS)}")

    corpus = state.get_corpus(stream)
    if corpus is None:
        raise HTTPException(
            status_code=503,
            detail=f"Corpus '{stream}' not available — DB not loaded at startup",
        )
    motor, offset_map = corpus

    skip_range = range(skip_min, skip_max + 1)
    return StreamingResponse(
        _stream(motor, offset_map, target, skip_range, book, limit),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def _stream_experiment(
    motor: bytes,
    target: str,
    skip_range: range,
    null_model: NullModel,
    n_iterations: int,
    seed: int,
) -> AsyncIterator[str]:
    from src.logic.stats.monte_carlo import run_experiment

    eta_ms = n_iterations * _ITER_MS[null_model]
    yield _sse_event("estimate", {"n_iterations": n_iterations, "eta_ms": eta_ms})

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[tuple[int, int] | None] = asyncio.Queue()

    def _progress(i: int, n: int) -> None:
        loop.call_soon_threadsafe(queue.put_nowait, (i, n))

    def _run() -> object:
        try:
            return run_experiment(motor, target, skip_range, null_model, n_iterations, seed=seed, progress=_progress)
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

    with ThreadPoolExecutor(max_workers=1) as pool:
        future = loop.run_in_executor(pool, _run)

        while True:
            item = await queue.get()
            if item is None:
                break
            i, n = item
            yield _sse_event("progress", {"iteration": i, "total": n})

    result = await future  # raises NotImplementedError if model is deferred

    yield _sse_event("result", {
        "observed_count": result.observed_count,
        "null_mean":      round(result.null_mean, 6),
        "null_std":       round(result.null_std, 6),
        "z_score":        round(result.z_score, 6),
        "p_value":        round(result.p_value, 8),
    })


@router.get("/test", summary="Monte Carlo significance test — SSE stream")
async def els_test_endpoint(
    target: str = Query(..., description="Hebrew consonants, 2–20 chars"),
    skip_min: int = Query(2, ge=2, le=10000),
    skip_max: int = Query(..., ge=2, le=10000),
    null_model: NullModel = Query(NullModel.BIGRAM_MARKOV, description="Null model"),
    iterations: int = Query(100, ge=1, le=10000),
    seed: int = Query(0),
    stream: str = Query("ketiv", description="Corpus stream: ketiv or qere"),
):
    _validate_target(target)
    if skip_min > skip_max:
        raise HTTPException(status_code=422, detail="skip_min must be ≤ skip_max")
    if stream not in _VALID_STREAMS:
        raise HTTPException(status_code=422, detail=f"stream must be one of {sorted(_VALID_STREAMS)}")
    if null_model not in _ITER_MS:
        raise HTTPException(status_code=501, detail=f"{null_model.value!r} not implemented until Sprint 7d")

    corpus = state.get_corpus(stream)
    if corpus is None:
        raise HTTPException(status_code=503, detail=f"Corpus '{stream}' not available — DB not loaded at startup")
    motor, _ = corpus

    skip_range = range(skip_min, skip_max + 1)
    return StreamingResponse(
        _stream_experiment(motor, target, skip_range, null_model, iterations, seed),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/corpora", summary="List available corpus streams")
def list_corpora():
    return {"streams": state.loaded_streams()}
