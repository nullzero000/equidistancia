"""CLI: ELS search — exploration tool for Sprint 5a audit.

Usage:
    python -m src.cli.els search --target תורה --skip-min 1 --skip-max 100
    python -m src.cli.els search --target יהוה --skip-min 1 --skip-max 1000 --book Genesis
    python -m src.cli.els search --target משיח --skip-min -100 --skip-max 100 --limit 20
"""
import argparse
import sys
import time
from pathlib import Path

DB_DEFAULT = Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db"


def _verse_label(word) -> str:
    return f"{word.book_en} {word.chapter}:{word.verse}"


def cmd_search(args) -> None:
    from src.logic.corpus.builder import build_motor, locate
    from src.logic.els.search import els_search

    db = Path(args.corpus)
    if not db.exists():
        sys.exit(f"DB not found: {db}")

    t0 = time.perf_counter()
    motor, offset_map = build_motor(db)
    build_ms = (time.perf_counter() - t0) * 1000

    skip_range = range(args.skip_min, args.skip_max + 1)

    t1 = time.perf_counter()
    results = list(els_search(motor, args.target, skip_range))
    search_ms = (time.perf_counter() - t1) * 1000

    # Optional book filter
    if args.book:
        book_lower = args.book.lower()
        filtered = []
        for r in results:
            try:
                w = locate(offset_map, r.start)
                if book_lower in w.book_en.lower():
                    filtered.append(r)
            except IndexError:
                pass
        results = filtered

    total = len(results)
    display = results[:args.limit]

    print(f"target={args.target}  skip=[{args.skip_min},{args.skip_max}]  "
          f"motor={len(motor):,}chars  build={build_ms:.0f}ms  search={search_ms:.0f}ms")
    print(f"matches={total}  showing={len(display)}")
    print()

    for r in display:
        try:
            start_word = locate(offset_map, r.start)
            end_word   = locate(offset_map, r.indices[-1])
        except IndexError:
            start_word = end_word = None

        span = (f"{_verse_label(start_word)}"
                if start_word and start_word == end_word
                else f"{_verse_label(start_word)} … {_verse_label(end_word)}"
                if start_word and end_word
                else "?")
        print(f"  skip={r.skip:+5d}  start={r.start:7d}  indices={r.indices}  {span}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m src.cli.els")
    sub = parser.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("search", help="ELS search over the motor")
    s.add_argument("--target", required=True, help="Hebrew target string")
    s.add_argument("--skip-min", type=int, default=1, metavar="N")
    s.add_argument("--skip-max", type=int, default=100, metavar="N")
    s.add_argument("--book", default="", help="Filter results to a book name (substring match)")
    s.add_argument("--limit", type=int, default=50, help="Max results to print (default 50)")
    s.add_argument("--corpus", default=str(DB_DEFAULT), help="Path to tanakh.db")

    args = parser.parse_args()
    if args.cmd == "search":
        cmd_search(args)


if __name__ == "__main__":
    main()
