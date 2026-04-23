"""ELS search — equidistant letter sequences.

Algorithm: for each skip, partition the motor into residue classes mod |skip|,
search each class for the target using bytes.find() (C-speed), translate back
to motor positions. Complexity: O(|motor| × Σ 1/k for k in skip_range).

Negative skip: search the reversed motor with positive |skip|, then map
positions back to the original motor. An ELS(start, -k) in the original
motor becomes ELS(n-1-start, +k) in the reversed motor.

Motor type: bytes (letter indices 0–21 per src.logic.corpus.encoding). Target
is accepted as str or bytes; str is encoded internally at the boundary.
"""
from typing import Iterator, NamedTuple

from src.logic.corpus.builder import MotorWord, locate
from src.logic.corpus.encoding import encode


class ELSResult(NamedTuple):
    target: str
    start: int          # motor position of target[0]
    skip: int           # signed letter spacing (negative = backward)
    indices: tuple[int, ...]  # motor positions of each letter; indices[i] = start + i*skip


def els_search(
    motor: bytes,
    target: str | bytes,
    skip_range: range,
) -> Iterator[ELSResult]:
    """Yield all ELS matches of target in motor for every skip in skip_range.

    skip_range must not include 0. Negative skips are handled by searching
    the reversed motor and translating positions.

    Example:
        list(els_search(motor_bytes, "תורה", range(50, 51)))
    """
    if not target:
        return

    target_str: str
    target_bytes: bytes
    if isinstance(target, bytes):
        target_bytes = target
        from src.logic.corpus.encoding import decode
        target_str = decode(target_bytes)
    else:
        target_str = target
        target_bytes = encode(target)

    n = len(motor)
    k = len(target_bytes)
    rev_motor = motor[::-1]

    for skip in skip_range:
        if skip == 0:
            continue

        search_buf = motor if skip > 0 else rev_motor
        abs_skip = abs(skip)
        min_length_needed = abs_skip * (k - 1) + 1

        if n < min_length_needed:
            continue

        for residue in range(abs_skip):
            sub = search_buf[residue::abs_skip]
            pos = 0
            while True:
                idx = sub.find(target_bytes, pos)
                if idx == -1:
                    break
                pos = idx + 1
                start_in_search = residue + idx * abs_skip
                last_in_search = start_in_search + (k - 1) * abs_skip
                if last_in_search >= n:
                    continue
                if skip > 0:
                    actual_start = start_in_search
                else:
                    actual_start = n - 1 - start_in_search
                indices = tuple(actual_start + i * skip for i in range(k))
                yield ELSResult(target_str, actual_start, skip, indices)


def locate_matches(
    motor: bytes,
    offset_map: tuple[MotorWord, ...],
    target: str,
    skip_range: range,
    limit: int = 1000,
) -> tuple[list[dict], bool]:
    """Locate first and last letter of each ELS match in the offset map.

    Returns (rows, truncated) where rows is a list of dicts ready for
    pandas/display and truncated is True if the result set was capped at limit.

    Each dict: {skip, start_pos, first_book, first_ref, last_book, last_ref}.
    first_ref / last_ref format: "Chapter:Verse" strings for compact display.

    limit caps materialisation to avoid OOM on targets with tens of thousands
    of matches (e.g. 3-letter targets over wide skip ranges).
    """
    rows: list[dict] = []
    for result in els_search(motor, target, skip_range):
        if len(rows) >= limit:
            return rows, True
        try:
            first = locate(offset_map, result.indices[0])
            last  = locate(offset_map, result.indices[-1])
        except IndexError:
            continue
        rows.append({
            "skip":      result.skip,
            "start_pos": result.start,
            "first_book": first.book_en,
            "first_ref":  f"{first.chapter}:{first.verse}",
            "last_book":  last.book_en,
            "last_ref":   f"{last.chapter}:{last.verse}",
        })
    return rows, False
