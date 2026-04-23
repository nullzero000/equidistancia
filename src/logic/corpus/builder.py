"""Build consonantal motor string + offset map from a tanakh DB."""
import sqlite3
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class MotorWord:
    """Maps a word's starting character index in the motor string to its location."""
    motor_start: int    # index of first char of this word in motor
    motor_end: int      # exclusive end index (motor[motor_start:motor_end] == form_he)
    book_en: str
    chapter: int
    verse: int
    position: int       # word index within the verse


def build_motor(db_path: str | Path) -> tuple[str, tuple[MotorWord, ...]]:
    """Concatenate all word forms in canonical order into a single motor string.

    Returns (motor, offset_map) where offset_map[i].motor_start <= char_idx
    for any char_idx in that word's range. Use locate() to look up a position.
    """
    path = str(db_path).replace("sqlite:///", "")
    conn = sqlite3.connect(path)
    rows = conn.execute(
        "SELECT w.form_he, b.name_en, v.chapter, v.verse, w.position "
        "FROM words w "
        "JOIN verses v ON v.id = w.verse_id "
        "JOIN books b ON b.id = v.book_id "
        "ORDER BY b.canonical_order, v.chapter, v.verse, w.position"
    ).fetchall()
    conn.close()

    parts: list[str] = []
    entries: list[MotorWord] = []
    idx = 0
    for form_he, book_en, chapter, verse, position in rows:
        end = idx + len(form_he)
        entries.append(MotorWord(idx, end, book_en, chapter, verse, position))
        parts.append(form_he)
        idx = end

    return "".join(parts), tuple(entries)


def locate(offset_map: tuple[MotorWord, ...], char_idx: int) -> MotorWord:
    """Binary search: return the MotorWord containing char_idx."""
    lo, hi = 0, len(offset_map) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        w = offset_map[mid]
        if char_idx < w.motor_start:
            hi = mid - 1
        elif char_idx >= w.motor_end:
            lo = mid + 1
        else:
            return w
    raise IndexError(f"char_idx {char_idx} out of motor range")
