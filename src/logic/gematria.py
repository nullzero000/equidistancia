"""
Gematria calculations.

Mispar Hechrechi (standard value): classical letter→integer mapping.
Mispar Shemi / Milui (filling): each letter spelled as its Hebrew name;
    sum of all letters in those expansions.

Reference: Gematria — en.wikipedia.org/wiki/Gematria
           Milui     — inner.org/gematria/gemfull.php
"""

HECHRECHI: dict[str, int] = {
    "א": 1,  "ב": 2,  "ג": 3,  "ד": 4,  "ה": 5,
    "ו": 6,  "ז": 7,  "ח": 8,  "ט": 9,  "י": 10,
    "כ": 20, "ך": 20, "ל": 30, "מ": 40, "ם": 40,
    "נ": 50, "ן": 50, "ס": 60, "ע": 70, "פ": 80,
    "ף": 80, "צ": 90, "ץ": 90, "ק": 100, "ר": 200,
    "ש": 300, "ת": 400,
}

# Milui: full spelling of each letter as a Hebrew word
MILUI_SPELLINGS: dict[str, str] = {
    "א": "אלף",  "ב": "בית",  "ג": "גימל", "ד": "דלת",  "ה": "הא",
    "ו": "ואו",  "ז": "זין",  "ח": "חית",  "ט": "טית",  "י": "יוד",
    "כ": "כף",   "ך": "כף",   "ל": "למד",  "מ": "מם",   "ם": "מם",
    "נ": "נון",  "ן": "נון",  "ס": "סמך",  "ע": "עין",  "פ": "פא",
    "ף": "פא",   "צ": "צדי",  "ץ": "צדי",  "ק": "קוף",  "ר": "ריש",
    "ש": "שין",  "ת": "תיו",
}


def gs(word: str) -> int:
    """Mispar Hechrechi: sum of standard letter values."""
    return sum(HECHRECHI.get(ch, 0) for ch in word)


def milui(word: str) -> int:
    """Mispar Shemi: sum of Gs of the full spelling of each letter."""
    total = 0
    for ch in word:
        spelling = MILUI_SPELLINGS.get(ch, ch)
        total += gs(spelling)
    return total


def strip_niqqud(text: str) -> str:
    """Remove niqqud (diacritics) and cantillation marks from Hebrew text.

    Unicode ranges:
      U+05B0–U+05C7  Hebrew points (niqqud)
      U+0591–U+05AF  Hebrew cantillation (teamim)
    """
    return "".join(
        ch for ch in text
        if not (0x0591 <= ord(ch) <= 0x05C7)
    )


def normalize_finals(text: str) -> str:
    """Normalize final letter forms to their standard equivalents."""
    finals_map = {"ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ"}
    return "".join(finals_map.get(ch, ch) for ch in text)


def normalize(word: str) -> str:
    return normalize_finals(strip_niqqud(word))
