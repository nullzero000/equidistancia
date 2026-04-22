"""
python -m scripts.ingest --source /path/to/Sefaria-Export/json/Tanakh [--policy gematria|els] [--milui]
"""

import argparse
import logging

from src.infrastructure.ingestion import run
from src.logic.cleaning.policy import ELS_POLICY, GEMATRIA_POLICY, GEMATRIA_QERE_POLICY

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

POLICIES = {
    "gematria": GEMATRIA_POLICY,
    "gematria-qere": GEMATRIA_QERE_POLICY,
    "els": ELS_POLICY,
}


def main():
    parser = argparse.ArgumentParser(description="Ingest Sefaria-Export into SQLite")
    parser.add_argument("--source", required=True, help="Path to Sefaria-Export/json/Tanakh")
    parser.add_argument("--db", default="sqlite:///data/processed/tanakh.db", help="SQLAlchemy DB URL")
    parser.add_argument("--policy", choices=list(POLICIES), default="gematria", help="Cleaning policy")
    parser.add_argument("--milui", action="store_true", help="Also compute Milui values (slower)")
    args = parser.parse_args()

    run(
        source_dir=args.source,
        db_url=args.db,
        policy=POLICIES[args.policy],
        compute_milui=args.milui,
    )


if __name__ == "__main__":
    main()
