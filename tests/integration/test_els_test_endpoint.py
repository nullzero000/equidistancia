"""Integration tests for GET /els/test (SSE Monte Carlo).

Requires tanakh.db. Skipped automatically if DB is absent.
client fixture provided by conftest.py (session-scoped).

Event contract:
  estimate  {"n_iterations": int, "eta_ms": int}
  progress  {"iteration": int, "total": int}   (0 or more)
  result    {"observed_count": int, "null_mean": float, "null_std": float,
             "z_score": float, "p_value": float}
"""
import json

import pytest


def _parse_sse(response) -> list[dict]:
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


def _test_params(**overrides) -> dict:
    base = {
        "target": "תורה",
        "skip_min": 50,
        "skip_max": 50,
        "null_model": "letter_shuffle",
        "iterations": 10,
        "seed": 42,
    }
    return {**base, **overrides}


# --- happy path ---

def test_event_sequence_estimate_progress_result(client):
    """Stream must open with estimate, contain ≥0 progress, close with result."""
    resp = client.get("/els/test", params=_test_params())
    assert resp.status_code == 200
    events = _parse_sse(resp)
    types = [e["event"] for e in events]
    assert types[0] == "estimate"
    assert types[-1] == "result"
    assert all(t in ("estimate", "progress", "result") for t in types)


def test_estimate_payload_contract(client):
    """estimate must carry n_iterations and eta_ms as positive integers."""
    resp = client.get("/els/test", params=_test_params(iterations=10))
    events = _parse_sse(resp)
    data = next(e["data"] for e in events if e["event"] == "estimate")
    assert data["n_iterations"] == 10
    assert isinstance(data["eta_ms"], int) and data["eta_ms"] > 0


def test_progress_count_equals_iterations(client):
    """Number of progress events must equal iterations."""
    n = 5
    resp = client.get("/els/test", params=_test_params(iterations=n))
    events = _parse_sse(resp)
    progress = [e for e in events if e["event"] == "progress"]
    assert len(progress) == n
    assert progress[-1]["data"]["iteration"] == n
    assert progress[-1]["data"]["total"] == n


def test_result_payload_contract(client):
    """result must carry all five statistical fields with correct types."""
    resp = client.get("/els/test", params=_test_params())
    events = _parse_sse(resp)
    data = next(e["data"] for e in events if e["event"] == "result")
    assert isinstance(data["observed_count"], int)
    assert isinstance(data["null_mean"], float)
    assert isinstance(data["null_std"], float)
    assert isinstance(data["z_score"], float)
    assert 0.0 < data["p_value"] <= 1.0


def test_seed_reproducibility(client):
    """Same seed must yield identical result payloads."""
    params = _test_params(iterations=8, seed=7)
    r1 = _parse_sse(client.get("/els/test", params=params))
    r2 = _parse_sse(client.get("/els/test", params=params))
    res1 = next(e["data"] for e in r1 if e["event"] == "result")
    res2 = next(e["data"] for e in r2 if e["event"] == "result")
    assert res1 == res2


def test_bigram_markov_runs(client):
    """bigram_markov must complete without error."""
    resp = client.get("/els/test", params=_test_params(null_model="bigram_markov", iterations=5))
    assert resp.status_code == 200
    events = _parse_sse(resp)
    assert any(e["event"] == "result" for e in events)


# --- error paths ---

def test_invalid_target_rejected(client):
    resp = client.get("/els/test", params=_test_params(target="hello"))
    assert resp.status_code == 422


def test_skip_min_gt_skip_max_rejected(client):
    resp = client.get("/els/test", params=_test_params(skip_min=100, skip_max=50))
    assert resp.status_code == 422


def test_invalid_stream_rejected(client):
    resp = client.get("/els/test", params=_test_params(stream="latin"))
    assert resp.status_code == 422


def test_deferred_null_model_returns_501(client):
    """residue_class and book_permutation are Sprint 7d — must return 501."""
    for model in ("residue_class", "book_permutation"):
        resp = client.get("/els/test", params=_test_params(null_model=model))
        assert resp.status_code == 501, f"Expected 501 for {model}, got {resp.status_code}"
