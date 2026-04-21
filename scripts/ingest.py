"""
python -m scripts.ingest --source /path/to/Sefaria-Export/json/Tanakh [--milui]
"""

import argparse
import logging

from src.infrastructure.ingestion import run

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


def main():
    parser = argparse.ArgumentParser(description="Ingest Sefaria-Export into SQLite")
    parser.add_argument("--source", required=True, help="Path to Sefaria-Export/json/Tanakh")
    parser.add_argument("--db", default="sqlite:///data/tanakh.db", help="SQLAlchemy DB URL")
    parser.add_argument("--milui", action="store_true", help="Also compute Milui values (slower)")
    args = parser.parse_args()

    run(source_dir=args.source, db_url=args.db, compute_milui=args.milui)


if __name__ == "__main__":
    main()
