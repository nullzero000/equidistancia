"""Inverse offset map lookup — biblical reference → motor character index.

Dual of locate(): locate maps char_idx → MotorWord; locate_inverse maps
(book, chapter, verse, letter_offset_in_verse) → char_idx.
"""
from src.logic.corpus.builder import MotorWord


def locate_inverse(
    offset_map: tuple[MotorWord, ...],
    book_en: str,
    chapter: int,
    verse: int,
    letter_offset_in_verse: int,
) -> int:
    """Return the motor index of a letter identified by biblical reference.

    Args:
        offset_map: Offset map from build_motor.
        book_en: English book name (e.g. "Genesis").
        chapter: Chapter number (1-based).
        verse: Verse number (1-based).
        letter_offset_in_verse: 0-based letter index within the verse
            (spans across word boundaries in canonical order).

    Returns:
        Absolute motor index of the requested letter.

    Raises:
        ValueError: If the book, chapter, or verse is not found in the
            offset_map, or if letter_offset_in_verse is out of range.
    """
    if letter_offset_in_verse < 0:
        raise ValueError(
            f"offset must be >= 0, got {letter_offset_in_verse}"
        )

    verse_words = [
        w for w in offset_map
        if w.book_en == book_en and w.chapter == chapter and w.verse == verse
    ]

    if not verse_words:
        book_words = [w for w in offset_map if w.book_en == book_en]
        if not book_words:
            raise ValueError(f"book not found: {book_en!r}")
        chapter_words = [w for w in book_words if w.chapter == chapter]
        if not chapter_words:
            raise ValueError(
                f"chapter not found: {book_en} {chapter} (verse {verse} not found)"
            )
        raise ValueError(f"verse not found: {book_en} {chapter}:{verse}")

    verse_start = min(w.motor_start for w in verse_words)
    verse_end   = max(w.motor_end   for w in verse_words)
    verse_length = verse_end - verse_start

    if letter_offset_in_verse >= verse_length:
        raise ValueError(
            f"offset {letter_offset_in_verse} out of range for {book_en} "
            f"{chapter}:{verse} (verse length {verse_length})"
        )

    return verse_start + letter_offset_in_verse
