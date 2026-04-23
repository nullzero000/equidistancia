"""
Measure word counts per book from the current ketiv corpus and emit
TOML-formatted invariant baselines ready to paste into config.toml.

Usage:
    python -m scripts.measure_nevi_ketuvim [--db sqlite:///data/processed/tanakh.db]

Output:
    TOML block for [invariants.letter_counts] — pipe to pbcopy or redirect.
"""
import argparse
import sqlite3
from pathlib import Path

DEFAULT_DB = "data/processed/tanakh.db"

TORAH = {"Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"}


def measure(db_path: str) -> list[tuple[str, int, int]]:
    """Return [(name_en, canonical_order, word_count)] for all books."""
    conn = sqlite3.connect(db_path)
    rows = conn.execute(
        "SELECT b.name_en, b.canonical_order, COUNT(w.id) "
        "FROM books b "
        "LEFT JOIN verses v ON v.book_id = b.id "
        "LEFT JOIN words w ON w.verse_id = v.id "
        "GROUP BY b.id "
        "ORDER BY b.canonical_order"
    ).fetchall()
    conn.close()
    return rows


def emit_toml(rows: list[tuple[str, int, int]], section: str) -> str:
    lines = [f"[{section}]"]
    for name, _, count in rows:
        key = name.replace(" ", "_").replace(".", "")
        lines.append(f'{key} = {count}  # empirical MAM/ketiv post-fix 2026-04-22')
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Measure per-book word counts from ketiv corpus")
    parser.add_argument("--db", default=DEFAULT_DB)
    parser.add_argument("--section", default="invariants.letter_counts",
                        help="TOML section header to emit")
    parser.add_argument("--nevi-ketuvim-only", action="store_true",
                        help="Emit only the 34 non-Torah books")
    args = parser.parse_args()

    if not Path(args.db.replace("sqlite:///", "")).exists():
        raise SystemExit(f"DB not found: {args.db}")

    rows = measure(args.db.replace("sqlite:///", ""))

    if args.nevi_ketuvim_only:
        rows = [(n, o, c) for n, o, c in rows if n not in TORAH]

    total = sum(c for _, _, c in rows)
    print(emit_toml(rows, args.section))
    print()
    print(f"# total across {len(rows)} books: {total}")


if __name__ == "__main__":
    main()
