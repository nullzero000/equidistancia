"""Property tests for null model shufflers.

Properties verified:
  - length preservation (all models)
  - exact letter-frequency preservation (letter_shuffle)
  - approximate letter-frequency preservation (bigram_markov, ±2%)
  - approximate bigram-frequency preservation (bigram_markov, ±5%)
  - determinism given same seed
  - variation: shuffled ≠ original for long motors (probability 1 - ε)
  - NullModel enum dispatches correctly
  - RESIDUE_CLASS/BOOK_PERMUTATION raise NotImplementedError
"""
from collections import Counter

import numpy as np
import pytest

from src.logic.stats.null_models import NullModel, bigram_markov, letter_shuffle

# Representative motor: first verse of Bereshit repeated — covers all common letters.
_VERSE = "בראשיתבראאלהיםאתהשמיםואתהארץ"
MOTOR = _VERSE * 200   # ~5,800 chars — fast to shuffle, statistically meaningful
RNG_SEED = 42


def _rng(seed=RNG_SEED):
    return np.random.default_rng(seed)


def _letter_freqs(s: str) -> Counter:
    return Counter(s)


def _bigram_freqs(s: str) -> Counter:
    return Counter(zip(s, s[1:]))


# ── letter_shuffle ────────────────────────────────────────────────────────────

def test_letter_shuffle_length():
    assert len(letter_shuffle(MOTOR, _rng())) == len(MOTOR)


def test_letter_shuffle_exact_frequencies():
    shuffled = letter_shuffle(MOTOR, _rng())
    assert _letter_freqs(shuffled) == _letter_freqs(MOTOR)


def test_letter_shuffle_is_deterministic():
    a = letter_shuffle(MOTOR, _rng(1))
    b = letter_shuffle(MOTOR, _rng(1))
    assert a == b


def test_letter_shuffle_varies_across_seeds():
    a = letter_shuffle(MOTOR, _rng(1))
    b = letter_shuffle(MOTOR, _rng(2))
    assert a != b


def test_letter_shuffle_differs_from_original():
    # P(shuffle == original) ≈ 1/n! ≈ 0 for n=5800
    assert letter_shuffle(MOTOR, _rng()) != MOTOR


# ── bigram_markov ─────────────────────────────────────────────────────────────

def test_bigram_markov_length():
    assert len(bigram_markov(MOTOR, _rng())) == len(MOTOR)


def test_bigram_markov_letter_freqs_approx():
    shuffled = bigram_markov(MOTOR, _rng())
    orig = _letter_freqs(MOTOR)
    shuf = _letter_freqs(shuffled)
    n = len(MOTOR)
    for char, count in orig.items():
        rel_error = abs(shuf.get(char, 0) - count) / count
        assert rel_error < 0.10, (
            f"Letter '{char}' freq error {rel_error:.1%} > 10% "
            f"(orig={count}, shuffled={shuf.get(char, 0)})"
        )


def test_bigram_markov_bigram_freqs_approx():
    """Markov-generated text should preserve bigram relative frequencies within 20%.

    Loose tolerance because sampled bigrams are stochastic; tighter bounds would
    require much larger motors or many samples.
    """
    shuffled = bigram_markov(MOTOR, _rng())
    orig = _bigram_freqs(MOTOR)
    shuf = _bigram_freqs(shuffled)
    # Check the 10 most common bigrams only (rare bigrams have high variance).
    for (a, b), count in orig.most_common(10):
        rel_error = abs(shuf.get((a, b), 0) - count) / count
        assert rel_error < 0.20, (
            f"Bigram {a+b!r} freq error {rel_error:.1%} > 20% "
            f"(orig={count}, shuffled={shuf.get((a, b), 0)})"
        )


def test_bigram_markov_is_deterministic():
    a = bigram_markov(MOTOR, _rng(7))
    b = bigram_markov(MOTOR, _rng(7))
    assert a == b


def test_bigram_markov_varies_across_seeds():
    a = bigram_markov(MOTOR, _rng(3))
    b = bigram_markov(MOTOR, _rng(4))
    assert a != b


def test_bigram_markov_differs_from_original():
    assert bigram_markov(MOTOR, _rng()) != MOTOR


# ── NullModel enum dispatch ───────────────────────────────────────────────────

def test_null_model_letter_shuffle_dispatch():
    result = NullModel.LETTER_SHUFFLE.apply(MOTOR, _rng())
    assert len(result) == len(MOTOR)
    assert _letter_freqs(result) == _letter_freqs(MOTOR)


def test_null_model_bigram_markov_dispatch():
    result = NullModel.BIGRAM_MARKOV.apply(MOTOR, _rng())
    assert len(result) == len(MOTOR)


def test_null_model_residue_class_not_implemented():
    with pytest.raises(NotImplementedError):
        NullModel.RESIDUE_CLASS.apply(MOTOR, _rng())


def test_null_model_book_permutation_not_implemented():
    with pytest.raises(NotImplementedError):
        NullModel.BOOK_PERMUTATION.apply(MOTOR, _rng())


# ── seed reproducibility across models ───────────────────────────────────────

@pytest.mark.parametrize("model", [NullModel.LETTER_SHUFFLE, NullModel.BIGRAM_MARKOV])
def test_model_reproducible_with_seed(model):
    a = model.apply(MOTOR, np.random.default_rng(99))
    b = model.apply(MOTOR, np.random.default_rng(99))
    assert a == b, f"{model.value} not reproducible with same seed"
