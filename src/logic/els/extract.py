"""ELS extract — read a sequence from the motor given (start, skip, length).

Dual of els_search: instead of searching for a target, extract_sequence reads
whatever letters emerge at the given equidistant positions without a
predefined target. locate_extract maps each position back to its canonical
reference via the offset_map.
"""
from typing import NamedTuple

from src.logic.corpus.builder import MotorWord, locate
from src.logic.corpus.encoding import HEBREW_LETTERS


class ExtractResult(NamedTuple):
    """Output of extract_sequence.

    Attributes:
        text: Hebrew string read from the motor at the equidistant positions.
        start: First motor position (indices[0]).
        skip: Signed letter spacing.
        indices: Motor positions of each letter in sequence order.
    """
    text: str
    start: int
    skip: int
    indices: tuple[int, ...]


class LetterRef(NamedTuple):
    """Per-letter location produced by locate_extract.

    Attributes:
        letter: The Hebrew letter at this position.
        motor_pos: Absolute position in the motor.
        book_en: English book name.
        ref: "chapter:verse" string.
    """
    letter: str
    motor_pos: int
    book_en: str
    ref: str


def extract_sequence(
    motor: bytes,
    start: int,
    skip: int,
    length: int,
) -> ExtractResult:
    """Read length letters from motor at positions start + i*skip for i in [0, length).

    Args:
        motor: Consonantal motor (bytes of letter indices 0-21).
        start: First motor position; must be in [0, len(motor)).
        skip: Signed letter spacing; must not be zero.
        length: Number of letters to extract; must be >= 1.

    Returns:
        ExtractResult with text, start, skip, and indices.

    Raises:
        ValueError: If skip == 0, length < 1, start is out of range, or the
            last index falls outside [0, len(motor)).
    """
    if skip == 0:
        raise ValueError("skip must not be zero")
    if length < 1:
        raise ValueError(f"length must be >= 1, got {length}")
    n = len(motor)
    if start < 0 or start >= n:
        raise ValueError(f"start {start} out of motor range [0, {n})")
    last_idx = start + (length - 1) * skip
    if last_idx < 0 or last_idx >= n:
        raise ValueError(
            f"last index {last_idx} out of bounds [0, {n}) — "
            f"reduce length or adjust skip (start={start}, skip={skip}, length={length})"
        )
    indices = tuple(start + i * skip for i in range(length))
    text = "".join(HEBREW_LETTERS[motor[idx]] for idx in indices)
    return ExtractResult(text=text, start=start, skip=skip, indices=indices)


def locate_extract(
    offset_map: tuple[MotorWord, ...],
    result: ExtractResult,
) -> list[LetterRef]:
    """Map each position in result.indices to its canonical LetterRef.

    Args:
        offset_map: Offset map from build_motor.
        result: ExtractResult from extract_sequence.

    Returns:
        List of LetterRef in the same order as result.indices.
    """
    refs: list[LetterRef] = []
    for i, pos in enumerate(result.indices):
        word = locate(offset_map, pos)
        refs.append(LetterRef(
            letter=result.text[i],
            motor_pos=pos,
            book_en=word.book_en,
            ref=f"{word.chapter}:{word.verse}",
        ))
    return refs
