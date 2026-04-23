"""Application state: motor cache keyed by corpus stream, populated at startup."""
from contextlib import asynccontextmanager
from pathlib import Path

from src.logic.corpus.builder import MotorWord, build_motor

_DB_PATHS: dict[str, Path] = {
    "ketiv": Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db",
    "qere":  Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh_qere.db",
}

# Populated at lifespan startup. Keys: stream names for which the DB exists.
_corpora: dict[str, tuple[str, tuple[MotorWord, ...]]] = {}


def get_corpus(stream: str) -> tuple[str, tuple[MotorWord, ...]] | None:
    """Return (motor, offset_map) for stream, or None if not loaded."""
    return _corpora.get(stream)


def loaded_streams() -> list[str]:
    return list(_corpora.keys())


@asynccontextmanager
async def lifespan(app):
    for stream, path in _DB_PATHS.items():
        if path.exists():
            _corpora[stream] = build_motor(path)
    yield
    _corpora.clear()
