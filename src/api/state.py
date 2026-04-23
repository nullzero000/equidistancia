"""Application state: motor cached once at startup via FastAPI lifespan."""
from contextlib import asynccontextmanager
from pathlib import Path

from src.logic.corpus.builder import MotorWord, build_motor

_DB_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db"

# Module-level cache — populated in lifespan, read by routers.
motor: str = ""
offset_map: tuple[MotorWord, ...] = ()


@asynccontextmanager
async def lifespan(app):
    global motor, offset_map
    if _DB_PATH.exists():
        motor, offset_map = build_motor(_DB_PATH)
    # else: tests or CI without DB — motor stays empty, corpus-dependent routes skip
    yield
    motor = ""
    offset_map = ()
