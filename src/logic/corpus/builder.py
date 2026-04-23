"""Build consonantal motor (bytes of letter indices) + offset map from a tanakh DB.

Motor representation: bytes of length N where N == number of Hebrew letters,
each byte is a letter index 0–21 via src.logic.corpus.encoding.

Letter count equals byte count, so MotorWord.motor_start/motor_end indices
are interchangeable between the old str motor and the new bytes motor.
"""
import sqlite3
from dataclasses import dataclass
from pathlib import Path

from src.logic.corpus.encoding import encode


@dataclass(frozen=True, slots=True)
class MotorWord:
    """Maps a word's letter-index range in the motor to its canonical location."""
    motor_start: int    # index of first letter of this word in motor
    motor_end: int      # exclusive end index (motor[motor_start:motor_end] == encoded form_he)
    book_en: str
    chapter: int
    verse: int
    position: int       # word index within the verse


def build_motor(db_path: str | Path) -> tuple[bytes, tuple[MotorWord, ...]]:
    """Concatenate encoded word forms in canonical order into a motor bytes object.

    Returns (motor, offset_map). offset_map preserves the letter-count invariants
    used by locate(): motor[w.motor_start : w.motor_end] == encode(form_he).
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

    parts: list[bytes] = []
    entries: list[MotorWord] = []
    idx = 0
    for form_he, book_en, chapter, verse, position in rows:
        form_bytes = encode(form_he)
        end = idx + len(form_bytes)
        entries.append(MotorWord(idx, end, book_en, chapter, verse, position))
        parts.append(form_bytes)
        idx = end

    return b"".join(parts), tuple(entries)


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
