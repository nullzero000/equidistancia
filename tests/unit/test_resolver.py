"""Unit tests for locate_inverse — (book, chapter, verse, letter_offset) → motor position.

Dual of src.logic.corpus.builder.locate(). Used by the UI extract mode to let
users specify a position by biblical reference instead of raw motor byte index.

Synthetic offset_map: Genesis 1:1 has 3 words of 2 letters each (positions 0–5),
Genesis 1:2 has 1 word of 3 letters (positions 6–8).
"""
import pytest

from src.logic.corpus.builder import MotorWord
from src.logic.corpus.resolver import locate_inverse


def _om():
    return (
        MotorWord(motor_start=0, motor_end=2, book_en="Genesis", chapter=1, verse=1, position=0),
        MotorWord(motor_start=2, motor_end=4, book_en="Genesis", chapter=1, verse=1, position=1),
        MotorWord(motor_start=4, motor_end=6, book_en="Genesis", chapter=1, verse=1, position=2),
        MotorWord(motor_start=6, motor_end=9, book_en="Genesis", chapter=1, verse=2, position=0),
    )


# ── happy path ────────────────────────────────────────────────────────────────


def test_first_letter_of_verse_returns_motor_start():
    om = _om()
    assert locate_inverse(om, "Genesis", 1, 1, 0) == 0
    assert locate_inverse(om, "Genesis", 1, 2, 0) == 6


def test_offset_spans_across_words_within_same_verse():
    om = _om()
    # Gen 1:1 word boundaries at 0, 2, 4; offset 2 is start of word 1, offset 3 is its second letter
    assert locate_inverse(om, "Genesis", 1, 1, 2) == 2
    assert locate_inverse(om, "Genesis", 1, 1, 3) == 3
    assert locate_inverse(om, "Genesis", 1, 1, 4) == 4


def test_last_valid_offset_of_verse():
    om = _om()
    # Gen 1:1 has 6 letters (indices 0..5), max valid offset is 5
    assert locate_inverse(om, "Genesis", 1, 1, 5) == 5
    # Gen 1:2 has 3 letters (indices 6..8), max valid offset is 2
    assert locate_inverse(om, "Genesis", 1, 2, 2) == 8


# ── validation ────────────────────────────────────────────────────────────────


def test_offset_past_end_of_verse_raises():
    om = _om()
    with pytest.raises(ValueError, match="offset|length"):
        locate_inverse(om, "Genesis", 1, 1, 6)


def test_negative_offset_raises():
    om = _om()
    with pytest.raises(ValueError, match="offset"):
        locate_inverse(om, "Genesis", 1, 1, -1)


def test_unknown_book_raises():
    om = _om()
    with pytest.raises(ValueError, match="book|not found"):
        locate_inverse(om, "Nonexistent", 1, 1, 0)


def test_unknown_chapter_raises():
    om = _om()
    with pytest.raises(ValueError, match="chapter|verse|not found"):
        locate_inverse(om, "Genesis", 99, 1, 0)


def test_unknown_verse_raises():
    om = _om()
    with pytest.raises(ValueError, match="verse|not found"):
        locate_inverse(om, "Genesis", 1, 99, 0)
