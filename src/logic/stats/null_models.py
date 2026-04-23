"""Null models for ELS Monte Carlo experiments (Sprint 7).

Each shuffler is a pure function: (motor, rng) -> str of the same length.
All randomness flows through the numpy Generator — reproducibility via
np.random.default_rng(seed) or a SeedSequence child seed (Sprint 7b).

Implemented:
  NullModel.LETTER_SHUFFLE   — uniform permutation, preserves marginal freqs exactly
  NullModel.BIGRAM_MARKOV    — order-1 Markov chain, preserves P(xᵢ₊₁|xᵢ)

Deferred (Sprint 7d):
  NullModel.RESIDUE_CLASS    — per-skip shuffle; null specific to ELS
  NullModel.BOOK_PERMUTATION — permute canonical book order; weakest null
"""
from __future__ import annotations

from collections import Counter
from enum import Enum

import numpy as np


def letter_shuffle(motor: str, rng: np.random.Generator) -> str:
    """Uniformly permute all characters. Preserves marginal letter frequencies exactly."""
    # Encode as uint32 code-points for O(n) in-place shuffle.
    arr = np.frombuffer(motor.encode("utf-32-le"), dtype=np.uint32).copy()
    rng.shuffle(arr)
    return arr.tobytes().decode("utf-32-le")


def bigram_markov(motor: str, rng: np.random.Generator) -> str:
    """Generate synthetic text of same length via first-order Markov chain.

    Transition probabilities estimated from motor bigrams. Initial state sampled
    from marginal letter frequencies. For skip K → ∞, converges to letter_shuffle.
    """
    chars = sorted(set(motor))
    n_states = len(chars)
    char_to_idx = {c: i for i, c in enumerate(chars)}

    # Build transition matrix from bigram counts (C-speed via Counter).
    trans = np.zeros((n_states, n_states), dtype=np.float64)
    for (a, b), count in Counter(zip(motor, motor[1:])).items():
        trans[char_to_idx[a], char_to_idx[b]] = count

    # Normalize rows; rows with zero mass get uniform fallback.
    row_sums = trans.sum(axis=1, keepdims=True)
    row_sums[row_sums == 0] = 1.0
    trans /= row_sums
    cum_trans = np.cumsum(trans, axis=1)  # (n_states, n_states) CDF rows

    # Initial state from marginal frequencies.
    counts = np.array([motor.count(c) for c in chars], dtype=np.float64)
    counts /= counts.sum()
    cum_counts = np.cumsum(counts)

    n = len(motor)
    result = np.empty(n, dtype=np.int32)
    uniforms = rng.random(n)

    state = int(np.searchsorted(cum_counts, uniforms[0]))
    state = min(state, n_states - 1)

    for i in range(n):
        result[i] = state
        nxt = int(np.searchsorted(cum_trans[state], uniforms[i]))
        state = min(nxt, n_states - 1)

    return "".join(chars[i] for i in result)


class NullModel(str, Enum):
    """Null models ordered by destructiveness (weakest last)."""
    LETTER_SHUFFLE   = "letter_shuffle"    # H₁: same letter frequencies
    BIGRAM_MARKOV    = "bigram_markov"     # H₂: same bigram structure  (default)
    RESIDUE_CLASS    = "residue_class"     # H₃: per-skip null (Sprint 7d)
    BOOK_PERMUTATION = "book_permutation"  # H₄: canonical order null (Sprint 7d)

    def apply(self, motor: str, rng: np.random.Generator) -> str:
        if self is NullModel.LETTER_SHUFFLE:
            return letter_shuffle(motor, rng)
        if self is NullModel.BIGRAM_MARKOV:
            return bigram_markov(motor, rng)
        raise NotImplementedError(f"{self.value!r} not implemented until Sprint 7d")
