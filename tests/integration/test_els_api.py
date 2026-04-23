"""Integration tests for GET /els/search (SSE).

Requires tanakh.db. Skipped automatically if DB is absent (CI without corpus).
"""
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_DATA = Path(__file__).resolve().parents[2] / "data" / "processed"
DB_KETIV = _DATA / "tanakh.db"
DB_QERE  = _DATA / "tanakh_qere.db"


@pytest.fixture(scope="module")
def client():
    if not DB_KETIV.exists():
        pytest.skip(f"DB missing: {DB_KETIV}")
    # Pre-populate state cache so TestClient doesn't need to run lifespan.
    import src.api.state as state
    from src.logic.corpus.builder import build_motor
    state._corpora["ketiv"] = build_motor(DB_KETIV)
    if DB_QERE.exists():
        state._corpora["qere"] = build_motor(DB_QERE)

    from src.api.routes import app
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


def _parse_sse(response) -> list[dict]:
    """Parse SSE text/event-stream into list of {event, data} dicts."""
    events = []
    current: dict = {}
    for line in response.text.splitlines():
        if line.startswith("event:"):
            current["event"] = line[len("event:"):].strip()
        elif line.startswith("data:"):
            current["data"] = json.loads(line[len("data:"):].strip())
        elif line == "" and current:
            events.append(current)
            current = {}
    if current:
        events.append(current)
    return events


def test_wrr_fixture_present(client):
    """WRR canonical match (תורה skip=50 start=5) must appear in the stream."""
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 50, "skip_max": 50,
        "book": "Genesis", "limit": 10,
    })
    assert resp.status_code == 200
    events = _parse_sse(resp)
    match_events = [e for e in events if e.get("event") == "match"]
    canonical = [e for e in match_events if e["data"]["start"] == 5 and e["data"]["skip"] == 50]
    assert canonical, f"WRR canonical match not found. matches: {[e['data'] for e in match_events]}"
    assert canonical[0]["data"]["indices"] == [5, 55, 105, 155]
    verses = canonical[0]["data"]["verses"]
    assert any(v["book"] == "Genesis" and v["chapter"] == 1 and v["verse"] == 1 for v in verses)


def test_stream_has_estimate_and_done(client):
    """Stream must open with estimate event and close with done event."""
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 50, "skip_max": 50, "limit": 5,
    })
    assert resp.status_code == 200
    events = _parse_sse(resp)
    event_types = [e["event"] for e in events]
    assert event_types[0] == "estimate"
    assert event_types[-1] == "done"
    assert events[0]["data"]["expected"] > 0


def test_limit_respected(client):
    """limit=3 must yield at most 3 match events."""
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 2, "skip_max": 100, "limit": 3,
    })
    assert resp.status_code == 200
    events = _parse_sse(resp)
    matches = [e for e in events if e["event"] == "match"]
    assert len(matches) <= 3
    done = next(e for e in events if e["event"] == "done")
    assert done["data"]["total_found"] <= 3


def test_invalid_target_rejected(client):
    resp = client.get("/els/search", params={
        "target": "hello", "skip_min": 2, "skip_max": 50,
    })
    assert resp.status_code == 422


def test_skip_min_gt_skip_max_rejected(client):
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 100, "skip_max": 50,
    })
    assert resp.status_code == 422


def test_non_hebrew_target_rejected(client):
    resp = client.get("/els/search", params={
        "target": "abc", "skip_min": 2, "skip_max": 10,
    })
    assert resp.status_code == 422


def test_invalid_stream_rejected(client):
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 2, "skip_max": 10, "stream": "latin",
    })
    assert resp.status_code == 422


def test_corpora_endpoint_lists_streams(client):
    resp = client.get("/els/corpora")
    assert resp.status_code == 200
    streams = resp.json()["streams"]
    assert "ketiv" in streams


def test_qere_wrr_fixture(client):
    """תורה skip=50 start=5 must also appear in the qere corpus."""
    import src.api.state as state
    if "qere" not in state._corpora:
        pytest.skip("qere DB not loaded")
    resp = client.get("/els/search", params={
        "target": "תורה", "skip_min": 50, "skip_max": 50,
        "book": "Genesis", "stream": "qere",
    })
    assert resp.status_code == 200
    events = _parse_sse(resp)
    matches = [e for e in events if e["event"] == "match"]
    canonical = [e for e in matches if e["data"]["start"] == 5 and e["data"]["skip"] == 50]
    assert canonical, f"WRR canonical not found in qere. matches: {[e['data'] for e in matches]}"
