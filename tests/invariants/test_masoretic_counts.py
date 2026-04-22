"""CI gate: corpus vs Ginsburg 1894 / Andersen-Forbes 1989."""
import sqlite3
from pathlib import Path
import pytest

DB = Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db"

TORAH_REFERENCE = {
    "Genesis":     20512,
    "Exodus":      16723,
    "Leviticus":   11950,
    "Numbers":     16713,
    "Deuteronomy": 14294,
}
TOTAL_REFERENCE = 305500
TOL_BOOK  = 0.02
TOL_TOTAL = 0.01


@pytest.fixture(scope="module")
def db():
    if not DB.exists():
        pytest.skip(f"DB missing: {DB}")
    conn = sqlite3.connect(DB)
    yield conn
    conn.close()


def test_total_within_tolerance(db):
    count = db.execute("SELECT COUNT(*) FROM words").fetchone()[0]
    delta = abs(count - TOTAL_REFERENCE) / TOTAL_REFERENCE
    assert delta < TOL_TOTAL, f"{count} vs {TOTAL_REFERENCE}: {delta:.2%}"


@pytest.mark.parametrize("book,expected", TORAH_REFERENCE.items())
def test_book_within_tolerance(db, book, expected):
    count = db.execute(
        'SELECT COUNT(w.id) FROM words w '
        'JOIN verses v ON v.id = w.verse_id '
        'JOIN books b ON b.id = v.book_id '
        'WHERE b.name_en = ?', (book,)
    ).fetchone()[0]
    delta = abs(count - expected) / expected
    assert delta < TOL_BOOK, f"{book}: {count} vs {expected}: {delta:.2%}"


def test_no_merged_pseudo_words(db):
    offenders = db.execute(
        "SELECT form_he FROM words WHERE form_he IN "
        "('אלתירא','אלתעמד','עלפני','אתהארץ','כלהעם','מןהארץ')"
    ).fetchall()
    assert not offenders, f"Merged tokens: {offenders}"


def test_standalone_particles_present(db):
    for particle, min_count in [("אל", 4000), ("על", 3000), ("את", 7000)]:
        n = db.execute(
            "SELECT COUNT(*) FROM words WHERE form_he = ?", (particle,)
        ).fetchone()[0]
        assert n >= min_count, f"'{particle}': {n} < {min_count}"
