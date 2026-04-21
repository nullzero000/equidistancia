"""
python -m scripts.add_shoresh --db sqlite:///data/processed/tanakh.db

Agrega columna `shoresh` a la tabla `words` y la puebla con extract().
No requiere reingestar — opera sobre el corpus existente.
"""

import argparse
import logging

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.infrastructure.schema import Word, get_engine
from src.logic.shoresh import extract

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BATCH_SIZE = 5000


def run(db_url: str) -> None:
    engine = get_engine(db_url)

    with engine.connect() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(words)"))]
        if "shoresh" not in cols:
            conn.execute(text("ALTER TABLE words ADD COLUMN shoresh TEXT"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_words_shoresh ON words(shoresh)"))
            conn.commit()
            logger.info("Columna shoresh creada.")
        else:
            logger.info("Columna shoresh ya existe.")

    with Session(engine) as session:
        total = session.query(Word).count()
        logger.info("Procesando %d palabras en batches de %d...", total, BATCH_SIZE)

        offset = 0
        processed = 0
        while True:
            batch = session.query(Word).offset(offset).limit(BATCH_SIZE).all()
            if not batch:
                break
            for word in batch:
                word.shoresh = extract(word.normalized)
            session.commit()
            processed += len(batch)
            offset += BATCH_SIZE
            logger.info("  %d / %d", processed, total)

    logger.info("Shoresh poblado.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default="sqlite:///data/processed/tanakh.db")
    args = parser.parse_args()
    run(args.db)
