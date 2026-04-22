"""Hebrew Unicode ranges per Unicode 15.0 Block (U+0590-U+05FF).

Refs:
- Unicode 15.0 TR-15 Normalization
- https://www.unicode.org/charts/PDF/U0590.pdf
"""
from typing import Final

CONSONANTS_START: Final[int] = 0x05D0  # א
CONSONANTS_END: Final[int]   = 0x05EA  # ת

NIQUD_START: Final[int] = 0x05B0
NIQUD_END: Final[int]   = 0x05BC

TEAMIM_START: Final[int] = 0x0591
TEAMIM_END: Final[int]   = 0x05AF

EXTENDED_POINTS_START: Final[int] = 0x05BD
EXTENDED_POINTS_END: Final[int]   = 0x05C7

MAQAF: Final[str]       = "־"
PASEQ: Final[str]       = "׀"
SOF_PASUQ: Final[str]   = "׃"
NUN_HAFUCHA: Final[str] = "׆"

# WRR-94 finals collapse (ך→כ, ם→מ, ן→נ, ף→פ, ץ→צ)
FINALS_COLLAPSE: Final[dict[str, str]] = {
    "ך": "כ",
    "ם": "מ",
    "ן": "נ",
    "ף": "פ",
    "ץ": "צ",
}
