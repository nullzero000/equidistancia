"""Verify אינסוף ELS matches letter-by-letter.

For each match, print: motor position, raw byte, decoded letter, expected
letter from the target, book/chapter/verse via locate(). Mismatches are
marked ✗ and would indicate a bug in search, encoding, or the motor itself
— the WRR canonical fixture would also fail in that case.

Run from repo root:
    python -m scripts.verify_einsof
"""
from src.logic.corpus.builder import build_motor, locate
from src.logic.corpus.encoding import decode, encode
from src.logic.els.search import els_search


def main() -> None:
    motor, offset_map = build_motor("data/processed/tanakh.db")
    target = "אינסוף"
    target_bytes = encode(target)
    expected_letters = [decode(bytes([b])) for b in target_bytes]

    print(f"Target     : {target}")
    print(f"Target bytes (finals collapsed): {list(target_bytes)}")
    print(f"Expected per-position letters  : {expected_letters}")
    print(f"Motor length: {len(motor):,} bytes")
    print()

    matches = list(els_search(motor, target, range(2, 1000)))
    print(f"Matches found (skip 2..999): {len(matches)}")
    print("=" * 78)

    for m_i, r in enumerate(matches):
        print(f"\nMatch #{m_i+1}  —  start={r.start}  skip={r.skip}")
        print("-" * 78)
        for i, idx in enumerate(r.indices):
            raw = motor[idx]
            letter = decode(bytes([raw]))
            expected = expected_letters[i]
            ok = "✓" if letter == expected else "✗"
            mw = locate(offset_map, idx)
            print(
                f"  {ok} letter[{i}]: motor_pos={idx:>8}  "
                f"byte={raw:>3}  got={letter}  expected={expected}  "
                f"@ {mw.book_en} {mw.chapter}:{mw.verse}"
            )


if __name__ == "__main__":
    main()
