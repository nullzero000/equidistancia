"""Unit tests for els_search and matrix_projection."""
import pytest
from src.logic.els.search import els_search, ELSResult
from src.logic.els.matrix import matrix_projection

# Minimal motor for predictable testing
MOTOR = "אבגדהוזחטיכלמנסעפצקרשתאבגדהוזחטיכלמנסעפצקרשתאבגדהוזחטיכלמנסעפצקרשת"
# positions: א=0, ב=1, ..., ת=21, repeating with period 22


def test_forward_skip_finds_match():
    # Plant "תורה" at positions 0, 5, 10, 15 — 4 x's between each (gap = 5)
    motor = "תxxxxוxxxxרxxxxהxxxx"
    results = list(els_search(motor, "תורה", range(5, 6)))
    assert results, "Expected to find תורה at skip=5"
    r = results[0]
    assert r.start == 0
    assert r.skip == 5
    assert r.indices == (0, 5, 10, 15)


def test_indices_consistency():
    motor = "שxxxxxלxxxxxוxxxxxמxxxxxxx"
    for r in els_search(motor, "שלום", range(1, 20)):
        expected = tuple(r.start + i * r.skip for i in range(len(r.target)))
        assert r.indices == expected, f"Indices inconsistent: {r}"


def test_negative_skip():
    # Plant "תרוש" backwards: motor[15]=ש, [10]=ו, [5]=ר, [0]=ת
    # Forward: ת at 0, ר at 5, ו at 10, ש at 15 → ELS(0, 5) = "תרוש"
    # Backward: ELS(15, -5) should find "שורת" if searching from 15 backwards
    motor = "תxxxxרxxxxוxxxxשxxxx"
    # Forward search finds "תרוש" at skip=5
    fwd = list(els_search(motor, "תרוש", range(5, 6)))
    assert fwd, "Forward search failed"
    assert fwd[0].start == 0 and fwd[0].skip == 5
    # Backward search finds "שורת" at skip=-5 (start=15, reading backwards)
    bwd = list(els_search(motor, "שורת", range(-5, -4)))
    assert bwd, "Backward search failed"
    assert bwd[0].start == 15 and bwd[0].skip == -5


def test_skip_zero_not_yielded():
    motor = "אאאאאאאאאא"
    results = list(els_search(motor, "א", range(-2, 3)))
    assert all(r.skip != 0 for r in results)


def test_empty_target_yields_nothing():
    assert list(els_search("אבגדה", "", range(1, 5))) == []


def test_no_match_outside_bounds():
    # target of length 4 at skip=10 needs motor length >= 31; motor is 25
    motor = "א" * 25
    results = list(els_search(motor, "אאאא", range(10, 11)))
    assert all(r.indices[-1] < 25 for r in results)


def test_matrix_projection_width():
    motor = "א" * 500
    rows = matrix_projection(motor, start=50, skip=50, context_rows=2)
    assert all(len(r) == 50 for r in rows), "All rows must have width == |skip|"


def test_matrix_match_column():
    # Motor: fill first 500 chars, plant ת at 5, ו at 55, ר at 105, ה at 155
    base = list("בראשית" * 100)  # arbitrary consonants
    motor_list = base[:200]
    motor_list[5]   = "ת"
    motor_list[55]  = "ו"
    motor_list[105] = "ר"
    motor_list[155] = "ה"
    motor = "".join(motor_list)
    rows = matrix_projection(motor, start=5, skip=50, context_rows=3)
    col = 5 % 50
    match_letters = [row[col] for row in rows if len(row) > col]
    assert "ת" in match_letters
    assert "ו" in match_letters


def test_matrix_negative_skip():
    rows = matrix_projection("א" * 300, start=200, skip=-50, context_rows=1)
    assert all(len(r) == 50 for r in rows)
