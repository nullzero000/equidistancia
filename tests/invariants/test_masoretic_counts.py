"""CI gate: corpus regression (layer 1, empirical MAM) + Ginsburg acceptance."""
import sqlite3
import tomllib
from pathlib import Path
import pytest

DB = Path(__file__).resolve().parents[2] / "data" / "processed" / "tanakh.db"
CONFIG = Path(__file__).resolve().parents[2] / "config.toml"

# Load baselines from config.toml
with open(CONFIG, "rb") as _f:
    _cfg = tomllib.load(_f)

_COUNTS = _cfg["invariants"]["letter_counts"]
_TOL = _cfg["invariants"]["masoretic_tolerance"]
_MIN_DELTA = 3  # absolute minimum for small books

TOTAL_REFERENCE = 305500  # Ginsburg 1894 (layer 2 acceptance, 1% tol)
TOL_TOTAL_GINSBURG = 0.01


@pytest.fixture(scope="module")
def db():
    if not DB.exists():
        pytest.skip(f"DB missing: {DB}")
    conn = sqlite3.connect(DB)
    yield conn
    conn.close()


@pytest.fixture(scope="module")
def book_counts(db):
    rows = db.execute(
        "SELECT b.name_en, COUNT(w.id) "
        "FROM books b "
        "LEFT JOIN verses v ON v.book_id = b.id "
        "LEFT JOIN words w ON w.verse_id = v.id "
        "GROUP BY b.id"
    ).fetchall()
    return {name: count for name, count in rows}


# Layer 1 — regression gate, 0.05% tolerance per book
@pytest.mark.parametrize("book,expected", [
    (name.replace("_", " "), count)
    for name, count in _COUNTS.items()
])
def test_book_regression(book_counts, book, expected):
    actual = book_counts.get(book, 0)
    tol = max(_MIN_DELTA, int(expected * _TOL))
    assert abs(actual - expected) <= tol, (
        f"{book}: {actual} vs baseline {expected} "
        f"(delta={abs(actual-expected)}, tol={tol})"
    )


# Layer 2 — Ginsburg 1894 acceptance, total only, 1% tolerance
def test_total_ginsburg_acceptance(db):
    count = db.execute("SELECT COUNT(*) FROM words").fetchone()[0]
    delta = abs(count - TOTAL_REFERENCE) / TOTAL_REFERENCE
    assert delta < TOL_TOTAL_GINSBURG, (
        f"Total {count} vs Ginsburg {TOTAL_REFERENCE}: {delta:.3%}"
    )


# Structural gates (source-agnostic)
def test_verse_count(db):
    assert db.execute("SELECT COUNT(*) FROM verses").fetchone()[0] == 23206


def test_book_count(db):
    assert db.execute("SELECT COUNT(*) FROM books").fetchone()[0] == 39


def test_no_merged_pseudo_words(db):
    offenders = db.execute(
        "SELECT form_he FROM words WHERE form_he IN "
        "('אלתירא','אלתעמד','עלפני','אתהארץ','כלהעם','מןהארץ')"
    ).fetchall()
    assert not offenders, f"Merged tokens still present: {offenders}"


def test_standalone_particles_present(db):
    for particle, min_count in [("אל", 4000), ("על", 3000), ("את", 7000)]:
        n = db.execute(
            "SELECT COUNT(*) FROM words WHERE form_he = ?", (particle,)
        ).fetchone()[0]
        assert n >= min_count, f"'{particle}': {n} < {min_count}"


def test_no_double_kq_ingestion(db):
    # Verify known mam-kq verse (II Kings 8:17) has ketiv form only, not both
    # ketiv=שנה qere=שנים — post-fix should yield שנה, NOT שנה+שנים adjacent
    rows = db.execute(
        "SELECT b.name_en, v.chapter, v.verse, "
        "GROUP_CONCAT(w.form_he || '@' || w.position, ',') as words "
        "FROM verses v "
        "JOIN books b ON b.id = v.book_id "
        "JOIN words w ON w.verse_id = v.id "
        "WHERE b.name_en = 'II Kings' AND v.chapter = 8 AND v.verse = 17"
    ).fetchone()
    assert rows is not None, "II Kings 8:17 not found"
    forms = [tok.split("@")[0] for tok in rows[3].split(",")]
    # The mam-kq span maps ketiv שנה → keeps שנה, not שנה+שנים
    assert forms.count("שנים") == 0, (
        f"II Kings 8:17 contains שנים — mam-kq qere leaked into ketiv corpus: {forms}"
    )
