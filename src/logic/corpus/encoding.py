"""Hebrew consonantal encoding — str ↔ bytes.

The motor is represented internally as bytes where each byte is an index 0–21
into HEBREW_LETTERS. This enables:

  1. numba @njit over the motor without Python string overhead
  2. bytes.find() at C-speed (same as str.find() used by the subsampled-string ELS
     algorithm), no performance regression
  3. np.frombuffer(motor, dtype=uint8) as a zero-copy ndarray view for stats

Encoding is lossless and bijective for texts in the Hebrew consonantal alphabet
(U+05D0–U+05EA). Any other codepoint raises KeyError at encode time — by design:
the cleaning pipeline guarantees only these 22 letters reach the motor.
"""
from __future__ import annotations

import numpy as np

HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשת"
N_LETTERS = len(HEBREW_LETTERS)  # 22

_CHAR_TO_IDX: dict[str, int] = {c: i for i, c in enumerate(HEBREW_LETTERS)}
_IDX_TO_CHAR: dict[int, str] = {i: c for c, i in _CHAR_TO_IDX.items()}

# Final-form → base-letter collapse (ELS convention: finals are not distinguished).
# Applied on the fly in encode() so the encoder is robust across cleaning policies.
_FINAL_TO_BASE: dict[str, str] = {
    "ך": "כ",  # final kaf
    "ם": "מ",  # final mem
    "ן": "נ",  # final nun
    "ף": "פ",  # final pe
    "ץ": "צ",  # final tsadi
}


def encode(s: str) -> bytes:
    """Encode a Hebrew consonantal string to bytes of letter indices.

    Final-form letters are collapsed to their base letters at encode time,
    matching the ELS convention that finals are not distinguished from their
    medial counterparts.
    """
    return bytes(_CHAR_TO_IDX[_FINAL_TO_BASE.get(c, c)] for c in s)


def decode(b: bytes) -> str:
    """Decode a bytes array of letter indices back to a Hebrew string."""
    return "".join(_IDX_TO_CHAR[i] for i in b)


def as_array(motor: bytes) -> np.ndarray:
    """Zero-copy uint8 ndarray view of a motor bytes object."""
    return np.frombuffer(motor, dtype=np.uint8)


def from_array(arr: np.ndarray) -> bytes:
    """Materialize a uint8 ndarray as bytes."""
    return arr.astype(np.uint8, copy=False).tobytes()
