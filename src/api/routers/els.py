"""ELS search router — SSE streaming endpoint.

Event sequence:
  event: estimate   data: {"expected": <int>}
  event: match      data: {"skip": <int>, "start": <int>, "indices": [...],
                            "verses": [{"book": ..., "chapter": ..., "verse": ...}]}
  ...
  event: done       data: {"total_found": <int>}
"""
import json
import re
from collections import Counter
from math import prod
from typing import Iterator

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from src.logic.corpus.builder import locate
from src.logic.els.search import ELSResult, els_search
import src.api.state as state

router = APIRouter()

_HEBREW_CONSONANTS = re.compile(r"^[א-ת]{2,20}$")


def _validate_target(target: str) -> None:
    if not _HEBREW_CONSONANTS.match(target):
        raise HTTPException(
            status_code=422,
            detail="target must be 2–20 Hebrew consonants (Unicode block 0x05D0–0x05EA)",
        )


def _expected_matches(motor: str, target: str, skip_range: range) -> int:
    n = len(motor)
    if n == 0:
        return 0
    freqs = Counter(motor)
    p = prod(freqs.get(c, 0) / n for c in target)
    return int(n * p * len(skip_range))


def _verse_refs(result: ELSResult) -> list[dict]:
    refs = []
    seen: set[tuple] = set()
    for idx in result.indices:
        try:
            w = locate(state.offset_map, idx)
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
    target: str,
    skip_range: range,
    book_filter: str,
    limit: int,
) -> Iterator[str]:
    motor = state.motor
    offset_map = state.offset_map

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
            "verses": _verse_refs(result),
        })

    yield _sse_event("done", {"total_found": total})


@router.get("/search", summary="ELS search — SSE stream")
def els_search_endpoint(
    target: str = Query(..., description="Hebrew consonants, 2–20 chars"),
    skip_min: int = Query(2, ge=2, le=10000),
    skip_max: int = Query(..., ge=2, le=10000),
    book: str = Query("", description="Book name substring filter (optional)"),
    limit: int = Query(100, ge=1, le=10000),
):
    _validate_target(target)
    if skip_min > skip_max:
        raise HTTPException(status_code=422, detail="skip_min must be ≤ skip_max")
    if not state.motor:
        raise HTTPException(status_code=503, detail="Motor not loaded — DB unavailable")

    skip_range = range(skip_min, skip_max + 1)
    return StreamingResponse(
        _stream(target, skip_range, book, limit),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
