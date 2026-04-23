"""ELS search — equidistant letter sequences.

Algorithm: for each skip, partition the motor into residue classes mod |skip|,
search each class for the target using str.find() (C-speed), translate back to
motor positions. Complexity: O(|motor| × Σ 1/k for k in skip_range).

Negative skip: search the reversed motor with positive |skip|, then map
positions back to the original motor. An ELS(start, -k) in the original
motor becomes ELS(n-1-start, +k) in the reversed motor.
"""
from typing import Iterator, NamedTuple


class ELSResult(NamedTuple):
    target: str
    start: int          # motor position of target[0]
    skip: int           # signed letter spacing (negative = backward)
    indices: tuple[int, ...]  # motor positions of each letter; indices[i] = start + i*skip


def els_search(
    motor: str,
    target: str,
    skip_range: range,
) -> Iterator[ELSResult]:
    """Yield all ELS matches of target in motor for every skip in skip_range.

    skip_range must not include 0. Negative skips are handled by searching
    the reversed motor and translating positions.

    Example:
        list(els_search(motor, "תורה", range(50, 51)))
    """
    if not target:
        return
    n = len(motor)
    k = len(target)
    rev_motor = motor[::-1]

    for skip in skip_range:
        if skip == 0:
            continue

        search_str = motor if skip > 0 else rev_motor
        abs_skip = abs(skip)
        min_length_needed = abs_skip * (k - 1) + 1

        if n < min_length_needed:
            continue

        for residue in range(abs_skip):
            sub = search_str[residue::abs_skip]
            pos = 0
            while True:
                idx = sub.find(target, pos)
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
                yield ELSResult(target, actual_start, skip, indices)
