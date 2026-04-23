"""Unit tests for els_search and matrix_projection.

Motor fixtures are declared as str for readability, then encoded to bytes
at the boundary. Target may be passed as str or bytes — els_search handles
both via the encoding module.
"""
import pytest

from src.logic.corpus.encoding import encode
from src.logic.els.search import els_search, ELSResult
from src.logic.els.matrix import matrix_projection


def _m(s: str) -> bytes:
    """Encode a Hebrew consonantal string to motor bytes.

    Replaces 'x' placeholders with an arbitrary non-target letter (ב). This
    keeps test motor strings readable while staying within the Hebrew-only
    invariant of the encoding module.
    """
    return encode(s.replace("x", "ב"))


def test_forward_skip_finds_match():
    # Plant "תורה" at positions 0, 5, 10, 15 — 4 x's between each (gap = 5)
    motor = _m("תxxxxוxxxxרxxxxהxxxx")
    results = list(els_search(motor, "תורה", range(5, 6)))
    assert results, "Expected to find תורה at skip=5"
    r = results[0]
    assert r.start == 0
    assert r.skip == 5
    assert r.indices == (0, 5, 10, 15)


def test_indices_consistency():
    motor = _m("שxxxxxלxxxxxוxxxxxמxxxxxxx")
    for r in els_search(motor, "שלום", range(1, 20)):
        expected = tuple(r.start + i * r.skip for i in range(len(r.target)))
        assert r.indices == expected, f"Indices inconsistent: {r}"


def test_negative_skip():
    motor = _m("תxxxxרxxxxוxxxxשxxxx")
    fwd = list(els_search(motor, "תרוש", range(5, 6)))
    assert fwd, "Forward search failed"
    assert fwd[0].start == 0 and fwd[0].skip == 5
    bwd = list(els_search(motor, "שורת", range(-5, -4)))
    assert bwd, "Backward search failed"
    assert bwd[0].start == 15 and bwd[0].skip == -5


def test_skip_zero_not_yielded():
    motor = _m("אאאאאאאאאא")
    results = list(els_search(motor, "א", range(-2, 3)))
    assert all(r.skip != 0 for r in results)


def test_empty_target_yields_nothing():
    assert list(els_search(_m("אבגדה"), "", range(1, 5))) == []


def test_no_match_outside_bounds():
    motor = _m("א" * 25)
    results = list(els_search(motor, "אאאא", range(10, 11)))
    assert all(r.indices[-1] < 25 for r in results)


def test_target_accepts_bytes_directly():
    motor = _m("תxxxxוxxxxרxxxxהxxxx")
    target_bytes = encode("תורה")
    results = list(els_search(motor, target_bytes, range(5, 6)))
    assert results, "bytes target should search identically to str target"
    assert results[0].target == "תורה"


def test_matrix_projection_width():
    motor = _m("א" * 500)
    rows = matrix_projection(motor, start=50, skip=50, context_rows=2)
    assert all(len(r) == 50 for r in rows), "All rows must have width == |skip|"


def test_matrix_match_column():
    base = list("בראשית" * 100)
    motor_list = base[:200]
    motor_list[5]   = "ת"
    motor_list[55]  = "ו"
    motor_list[105] = "ר"
    motor_list[155] = "ה"
    motor = encode("".join(motor_list))
    rows = matrix_projection(motor, start=5, skip=50, context_rows=3)
    col = 5 % 50
    match_letters = [row[col] for row in rows if len(row) > col]
    assert "ת" in match_letters
    assert "ו" in match_letters


def test_matrix_negative_skip():
    rows = matrix_projection(_m("א" * 300), start=200, skip=-50, context_rows=1)
    assert all(len(r) == 50 for r in rows)
