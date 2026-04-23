"""Unit tests for locate_matches."""
import pytest
from src.logic.corpus.builder import build_motor
from src.logic.els.search import locate_matches

_MOTOR_STR = "תורהאבגדה"  # 9-letter synthetic motor


def _synthetic():
    from src.logic.corpus.encoding import encode
    from src.logic.corpus.builder import MotorWord
    motor = encode(_MOTOR_STR)
    # one MotorWord per letter for simplicity
    offset_map = tuple(
        MotorWord(i, i + 1, "Genesis", 1, i + 1, 0) for i in range(len(motor))
    )
    return motor, offset_map


def test_returns_tuple_of_list_and_bool():
    motor, offset_map = _synthetic()
    rows, truncated = locate_matches(motor, offset_map, "תורה", range(1, 2))
    assert isinstance(rows, list)
    assert isinstance(truncated, bool)


def test_zero_matches_returns_empty_not_truncated():
    motor, offset_map = _synthetic()
    rows, truncated = locate_matches(motor, offset_map, "יהוה", range(1, 5))
    assert rows == []
    assert truncated is False


def test_known_match_skip1_correct_refs():
    motor, offset_map = _synthetic()
    # תורה at positions 0,1,2,3 with skip=1
    rows, _ = locate_matches(motor, offset_map, "תורה", range(1, 2))
    assert len(rows) == 1
    r = rows[0]
    assert r["skip"] == 1
    assert r["start_pos"] == 0
    assert r["first_ref"] == "1:1"   # MotorWord at pos 0: chapter=1, verse=1
    assert r["last_ref"] == "1:4"    # MotorWord at pos 3: chapter=1, verse=4


def test_row_dict_has_required_keys():
    motor, offset_map = _synthetic()
    rows, _ = locate_matches(motor, offset_map, "תורה", range(1, 2))
    assert rows, "expected at least one match"
    keys = {"skip", "start_pos", "first_book", "first_ref", "last_book", "last_ref"}
    assert keys <= rows[0].keys()


def test_limit_truncates_and_signals():
    motor, offset_map = _synthetic()
    # תורה with skip=1 gives exactly 1 match; use limit=0 to force truncation
    rows, truncated = locate_matches(motor, offset_map, "תורה", range(1, 2), limit=0)
    assert rows == []
    assert truncated is True


def test_negative_skip_match():
    """Backward ELS: הרות at skip=-1 from position 3."""
    motor, offset_map = _synthetic()
    rows, _ = locate_matches(motor, offset_map, "הרות", range(-1, 0))
    assert len(rows) == 1
    assert rows[0]["skip"] == -1
