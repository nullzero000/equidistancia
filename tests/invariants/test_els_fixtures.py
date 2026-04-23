"""ELS regression fixtures — CI gate.

Fixture canónico: תורה con skip=50 desde Bereshit 1:1.
Documentado en WRR-94 (Statistical Science 9:3, 1994) y confirmado
como ocurrencia válida en McKay et al. 1999 §4 pre-controversia.
"""
from pathlib import Path
import pytest
from src.logic.corpus.builder import build_motor, locate
from src.logic.els.search import els_search

DB = Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db"

# Empirically verified against MAM/ketiv corpus, commit 1160393:
WRR_TORAH_START  = 5     # motor index of the ת in בראשית
WRR_TORAH_SKIP   = 50
WRR_TORAH_TARGET = "תורה"
WRR_TORAH_INDICES = (5, 55, 105, 155)


@pytest.fixture(scope="module")
def motor_and_map():
    if not DB.exists():
        pytest.skip(f"DB missing: {DB}")
    return build_motor(DB)


def test_torah_skip_50_exists(motor_and_map):
    """תורה at skip=50 must be findable — validates ELS engine and motor build."""
    motor, _ = motor_and_map
    matches = list(els_search(motor, WRR_TORAH_TARGET, range(WRR_TORAH_SKIP, WRR_TORAH_SKIP + 1)))
    assert matches, "תורה at skip=50 not found — ELS engine or motor build broken"


def test_torah_skip_50_canonical_position(motor_and_map):
    """The canonical WRR instance starts at motor index 5 (ת of בראשית, Gen 1:1)."""
    motor, offset_map = motor_and_map
    matches = list(els_search(motor, WRR_TORAH_TARGET, range(WRR_TORAH_SKIP, WRR_TORAH_SKIP + 1)))
    canonical = [m for m in matches if m.start == WRR_TORAH_START]
    assert canonical, (
        f"Canonical WRR match at start={WRR_TORAH_START} not found. "
        f"All matches at skip=50: {[m.start for m in matches[:10]]}"
    )
    m = canonical[0]
    assert m.indices == WRR_TORAH_INDICES, f"Indices mismatch: {m.indices}"


def test_torah_skip_50_in_genesis(motor_and_map):
    """The canonical match must fall within Genesis."""
    motor, offset_map = motor_and_map
    word = locate(offset_map, WRR_TORAH_START)
    assert word.book_en == "Genesis", f"Expected Genesis, got {word.book_en}"
    assert word.chapter == 1 and word.verse == 1


def test_motor_letter_identity(motor_and_map):
    """motor[i] for each canonical index must match the expected letter."""
    motor, _ = motor_and_map
    for idx, expected_letter in zip(WRR_TORAH_INDICES, WRR_TORAH_TARGET):
        assert motor[idx] == expected_letter, (
            f"motor[{idx}]={motor[idx]!r} ≠ {expected_letter!r}"
        )


def test_els_search_no_false_skip_zero(motor_and_map):
    """els_search must never yield skip=0 results."""
    motor, _ = motor_and_map
    # search a short prefix to keep it fast
    prefix = motor[:10000]
    for r in els_search(prefix, "תורה", range(-5, 6)):
        assert r.skip != 0
