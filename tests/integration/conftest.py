"""Shared fixtures for integration tests."""
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_DATA = Path(__file__).resolve().parents[2] / "data" / "processed"
DB_KETIV = _DATA / "tanakh.db"
DB_QERE  = _DATA / "tanakh_qere.db"


@pytest.fixture(scope="session")
def client():
    if not DB_KETIV.exists():
        pytest.skip(f"DB missing: {DB_KETIV}")
    import src.api.state as state
    from src.logic.corpus.builder import build_motor
    state._corpora["ketiv"] = build_motor(DB_KETIV)
    if DB_QERE.exists():
        state._corpora["qere"] = build_motor(DB_QERE)

    from src.api.routes import app
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
