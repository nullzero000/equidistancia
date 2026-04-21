from __future__ import annotations

_PREFIXES = [
    "ובמ", "ולמ", "וכמ",
    "וב", "וכ", "ול", "ומ", "וש",
    "הב", "הכ", "הל", "המ",
    "לכ", "במ", "כמ",
    "ו", "ה", "ב", "כ", "ל", "מ", "ש",
]

_SUFFIXES = [
    "ותיהם", "ותיהן",
    "ותיכם", "ותיכן",
    "יהם", "יהן", "יכם",
    "יכן", "ינו",
    "תים", "תין", "תיו", "תיה",
    "הם", "הן", "כם", "כן", "נו",
    "ות", "ים", "תי", "תם", "תן",
    "יו", "יה", "יי",
    "וני", "ון", "ית",
    "ה", "ו", "י", "ך", "ת",
]

_VERBAL_PREFIXES = ["י", "ת", "נ", "א"]


def _strip_suffixes(word: str) -> str:
    changed = True
    while changed:
        changed = False
        for suffix in _SUFFIXES:
            if word.endswith(suffix) and len(word) - len(suffix) >= 3:
                word = word[:-len(suffix)]
                changed = True
                break
    return word


def _strip_prefixes(word: str) -> str:
    for prefix in _PREFIXES:
        if word.startswith(prefix) and len(word) - len(prefix) >= 3:
            return word[len(prefix):]
    return word


def _strip_verbal_prefix(word: str) -> str:
    for prefix in _VERBAL_PREFIXES:
        if word.startswith(prefix) and len(word) - len(prefix) >= 3:
            return word[len(prefix):]
    return word


def extract(word: str) -> str:
    if len(word) <= 3:
        return word
    stem = _strip_suffixes(word)
    stem = _strip_prefixes(stem)
    stem = _strip_suffixes(stem)
    stem = _strip_verbal_prefix(stem)
    return stem if len(stem) >= 3 else word


def share_root(word1: str, word2: str) -> bool:
    return extract(word1) == extract(word2)


def root_family(root: str, corpus: list[str]) -> list[str]:
    target = extract(root)
    return [w for w in corpus if extract(w) == target]
