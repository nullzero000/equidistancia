"""Pure function: (text, policy) -> list[str]. No globals, no I/O."""
import re
from src.logic.cleaning.policy import CleaningPolicy
from src.logic.cleaning.separators import (
    NON_HEBREW, WORD_SEP, HTML_TAG, HTML_ENTITY, PARASHA_MARK,
    MAM_KQ, MAM_KQ_K, MAM_KQ_Q,
)
from src.logic.cleaning.unicode_ranges import FINALS_COLLAPSE


def _resolve_kq(text: str, stream: str) -> str:
    """Replace mam-kq spans with the form selected by stream (ketiv|qere)."""
    inner = MAM_KQ_K if stream == "ketiv" else MAM_KQ_Q

    def _pick(m: re.Match) -> str:
        hit = inner.search(m.group(0))
        return hit.group(1) if hit else ""

    return MAM_KQ.sub(_pick, text)


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
    text = _resolve_kq(text, policy.stream)
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
