"""Unit tests for extract_sequence and locate_extract.

extract_sequence is the dual of els_search: given (start, skip, length) without
a predefined target, read letters at motor[start + i*skip] for i in [0, length)
and return the resulting string. locate_extract maps an ExtractResult back to
per-letter references via the offset_map.

Contract pillars:
  - skip != 0 (skip=0 is undefined ELS behaviour)
  - length >= 1
  - 0 <= start < n
  - 0 <= start + (length-1)*skip < n  (end index must stay in bounds)
  - Negative skip reads backward; indices preserve signed order
"""
import pytest

from src.logic.corpus.encoding import encode
from src.logic.corpus.builder import MotorWord
from src.logic.els.extract import (
    ExtractResult,
    LetterRef,
    extract_sequence,
    locate_extract,
)


_MOTOR_STR = "תורהאבגדה"  # 9 letters, positions 0..8


def _synthetic():
    motor = encode(_MOTOR_STR)
    # one MotorWord per letter for granular ref lookup
    offset_map = tuple(
        MotorWord(i, i + 1, "Genesis", 1, i + 1, 0) for i in range(len(motor))
    )
    return motor, offset_map


# ── extract_sequence: happy path ──────────────────────────────────────────────


def test_forward_skip_one_returns_consecutive_letters():
    motor, _ = _synthetic()
    r = extract_sequence(motor, start=0, skip=1, length=4)
    assert isinstance(r, ExtractResult)
    assert r.text == "תורה"
    assert r.start == 0
    assert r.skip == 1
    assert r.indices == (0, 1, 2, 3)


def test_forward_skip_two_returns_every_other_letter():
    motor, _ = _synthetic()
    # "תורהאבגדה"[0::2][:3] == "תרא"
    r = extract_sequence(motor, start=0, skip=2, length=3)
    assert r.text == "תרא"
    assert r.indices == (0, 2, 4)


def test_negative_skip_reads_backward():
    motor, _ = _synthetic()
    # start=3 (ה), skip=-1 → indices (3, 2, 1, 0) → "הרות"
    r = extract_sequence(motor, start=3, skip=-1, length=4)
    assert r.text == "הרות"
    assert r.indices == (3, 2, 1, 0)
    assert r.skip == -1


def test_length_one_returns_single_letter():
    motor, _ = _synthetic()
    r = extract_sequence(motor, start=5, skip=1, length=1)
    assert r.text == "ב"
    assert r.indices == (5,)


def test_indices_formula_holds():
    motor, _ = _synthetic()
    r = extract_sequence(motor, start=1, skip=3, length=3)
    # indices must satisfy indices[i] == start + i * skip
    assert r.indices == tuple(r.start + i * r.skip for i in range(len(r.text)))


# ── extract_sequence: validation ──────────────────────────────────────────────


def test_skip_zero_raises():
    motor, _ = _synthetic()
    with pytest.raises(ValueError, match="skip"):
        extract_sequence(motor, start=0, skip=0, length=4)


def test_length_zero_raises():
    motor, _ = _synthetic()
    with pytest.raises(ValueError, match="length"):
        extract_sequence(motor, start=0, skip=1, length=0)


def test_negative_length_raises():
    motor, _ = _synthetic()
    with pytest.raises(ValueError, match="length"):
        extract_sequence(motor, start=0, skip=1, length=-3)


def test_start_out_of_bounds_raises():
    motor, _ = _synthetic()  # len=9
    with pytest.raises(ValueError, match="start"):
        extract_sequence(motor, start=9, skip=1, length=1)
    with pytest.raises(ValueError, match="start"):
        extract_sequence(motor, start=-1, skip=1, length=1)


def test_forward_overflow_raises():
    motor, _ = _synthetic()  # len=9
    # start=7, skip=1, length=5 → last idx = 11 (out of bounds)
    with pytest.raises(ValueError, match="bounds|length"):
        extract_sequence(motor, start=7, skip=1, length=5)


def test_backward_underflow_raises():
    motor, _ = _synthetic()  # len=9
    # start=2, skip=-1, length=5 → last idx = -2 (out of bounds)
    with pytest.raises(ValueError, match="bounds|length"):
        extract_sequence(motor, start=2, skip=-1, length=5)


def test_exact_boundary_does_not_raise():
    motor, _ = _synthetic()  # len=9
    # start=0, skip=1, length=9 → last idx = 8 (inclusive, valid)
    r = extract_sequence(motor, start=0, skip=1, length=9)
    assert r.text == _MOTOR_STR


# ── locate_extract ────────────────────────────────────────────────────────────


def test_locate_extract_returns_letter_ref_per_position():
    motor, offset_map = _synthetic()
    r = extract_sequence(motor, start=0, skip=1, length=4)
    refs = locate_extract(offset_map, r)
    assert len(refs) == 4
    assert all(isinstance(x, LetterRef) for x in refs)


def test_locate_extract_preserves_letter_and_motor_position():
    motor, offset_map = _synthetic()
    r = extract_sequence(motor, start=0, skip=2, length=3)
    refs = locate_extract(offset_map, r)
    assert refs[0].letter == "ת" and refs[0].motor_pos == 0
    assert refs[1].letter == "ר" and refs[1].motor_pos == 2
    assert refs[2].letter == "א" and refs[2].motor_pos == 4


def test_locate_extract_populates_book_and_ref():
    motor, offset_map = _synthetic()
    r = extract_sequence(motor, start=0, skip=1, length=2)
    refs = locate_extract(offset_map, r)
    assert refs[0].book_en == "Genesis"
    assert refs[0].ref == "1:1"
    assert refs[1].ref == "1:2"


def test_locate_extract_ordering_matches_result_indices():
    motor, offset_map = _synthetic()
    r = extract_sequence(motor, start=3, skip=-1, length=4)
    refs = locate_extract(offset_map, r)
    # refs[i] must correspond to r.indices[i] — reverse reading order preserved
    assert [x.motor_pos for x in refs] == [3, 2, 1, 0]
    assert [x.letter for x in refs] == list("הרות")
