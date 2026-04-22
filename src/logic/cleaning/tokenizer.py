"""Pure function: (text, policy) -> list[str]. No globals, no I/O."""
from src.logic.cleaning.policy import CleaningPolicy
from src.logic.cleaning.separators import (
    NON_HEBREW, WORD_SEP, HTML_TAG, HTML_ENTITY, PARASHA_MARK,
)
from src.logic.cleaning.unicode_ranges import FINALS_COLLAPSE


def _strip_noise(text: str) -> str:
    text = HTML_TAG.sub("", text)
    text = HTML_ENTITY.sub("", text)
    text = PARASHA_MARK.sub("", text)
    return text


def _collapse_finals(text: str) -> str:
    return "".join(FINALS_COLLAPSE.get(ch, ch) for ch in text)


def tokenize(text: str, policy: CleaningPolicy) -> list[str]:
    """Deterministic, idempotent tokenization.

    Contract: tokenize(" ".join(tokenize(x, p)), p) == tokenize(x, p)
    """
    text = _strip_noise(text)
    tokens: list[str] = []
    for token in WORD_SEP.split(text):
        hebrew_only = NON_HEBREW.sub("", token)
        if not hebrew_only:
            continue
        if policy.collapse_finals:
            hebrew_only = _collapse_finals(hebrew_only)
        tokens.append(hebrew_only)
    return tokens
