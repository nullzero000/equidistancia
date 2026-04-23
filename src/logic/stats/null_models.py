"""Null models for ELS Monte Carlo experiments (Sprint 7).

Each shuffler is a pure function: (motor, rng) -> bytes of the same length.
All randomness flows through the numpy Generator — reproducibility via
np.random.default_rng(seed) or a SeedSequence child seed.

Motor type: bytes of letter indices 0–21 (src.logic.corpus.encoding). This
representation lets numba @njit the full pipeline without Python string /
dict overhead. Ref: Lam, Pitrou, Seibert (2015), "Numba: A LLVM-based Python
JIT Compiler", Proc. LLVM-HPC 2015: 7:1-7:6.

Implemented:
  NullModel.LETTER_SHUFFLE   — uniform permutation, preserves marginal freqs exactly
  NullModel.BIGRAM_MARKOV    — order-1 Markov chain, preserves P(xᵢ₊₁|xᵢ)

Deferred (Sprint 7d):
  NullModel.RESIDUE_CLASS    — per-skip shuffle; null specific to ELS
  NullModel.BOOK_PERMUTATION — permute canonical book order; weakest null
"""
from __future__ import annotations

from enum import Enum

import numpy as np
from numba import njit

from src.logic.corpus.encoding import N_LETTERS, as_array


def letter_shuffle(motor: bytes, rng: np.random.Generator) -> bytes:
    """Uniformly permute all letters. Preserves marginal frequencies exactly."""
    arr = as_array(motor).copy()
    rng.shuffle(arr)
    return arr.tobytes()


@njit(cache=True)
def _build_cdf(motor_arr: np.ndarray, n_states: int) -> tuple[np.ndarray, np.ndarray]:
    """Build CDF of bigram transitions + CDF of marginal letter frequencies."""
    n = motor_arr.shape[0]
    trans = np.zeros((n_states, n_states), dtype=np.float64)
    marg = np.zeros(n_states, dtype=np.float64)

    for i in range(n):
        marg[motor_arr[i]] += 1.0
    for i in range(n - 1):
        trans[motor_arr[i], motor_arr[i + 1]] += 1.0

    # Normalize rows; zero-mass rows fall back to uniform.
    for r in range(n_states):
        row_sum = 0.0
        for c in range(n_states):
            row_sum += trans[r, c]
        if row_sum == 0.0:
            for c in range(n_states):
                trans[r, c] = 1.0 / n_states
        else:
            for c in range(n_states):
                trans[r, c] /= row_sum

    cum_trans = np.empty_like(trans)
    for r in range(n_states):
        acc = 0.0
        for c in range(n_states):
            acc += trans[r, c]
            cum_trans[r, c] = acc

    marg_total = 0.0
    for s in range(n_states):
        marg_total += marg[s]
    cum_marg = np.empty(n_states, dtype=np.float64)
    acc = 0.0
    for s in range(n_states):
        acc += marg[s] / marg_total
        cum_marg[s] = acc

    return cum_trans, cum_marg


@njit(cache=True)
def _sample_markov(
    cum_trans: np.ndarray,
    cum_marg: np.ndarray,
    uniforms: np.ndarray,
    n: int,
    n_states: int,
) -> np.ndarray:
    """Sample n states from a Markov chain with pre-built CDFs."""
    out = np.empty(n, dtype=np.uint8)

    # Initial state from marginal CDF (linear scan — n_states is tiny, 22).
    u0 = uniforms[0]
    state = 0
    while state < n_states - 1 and cum_marg[state] < u0:
        state += 1
    out[0] = state

    for i in range(1, n):
        u = uniforms[i]
        row = cum_trans[state]
        nxt = 0
        while nxt < n_states - 1 and row[nxt] < u:
            nxt += 1
        state = nxt
        out[i] = state

    return out


def bigram_markov(motor: bytes, rng: np.random.Generator) -> bytes:
    """Generate synthetic text of same length via first-order Markov chain.

    Transition probabilities estimated from motor bigrams. Initial state
    sampled from marginal letter frequencies. For skip K → ∞, converges to
    letter_shuffle.
    """
    motor_arr = as_array(motor)
    n = motor_arr.shape[0]
    cum_trans, cum_marg = _build_cdf(motor_arr, N_LETTERS)
    uniforms = rng.random(n)
    out = _sample_markov(cum_trans, cum_marg, uniforms, n, N_LETTERS)
    return out.tobytes()


class NullModel(str, Enum):
    """Null models ordered by destructiveness (weakest last)."""
    LETTER_SHUFFLE   = "letter_shuffle"    # H₁: same letter frequencies
    BIGRAM_MARKOV    = "bigram_markov"     # H₂: same bigram structure  (default)
    RESIDUE_CLASS    = "residue_class"     # H₃: per-skip null (Sprint 7d)
    BOOK_PERMUTATION = "book_permutation"  # H₄: canonical order null (Sprint 7d)

    def apply(self, motor: bytes, rng: np.random.Generator) -> bytes:
        if self is NullModel.LETTER_SHUFFLE:
            return letter_shuffle(motor, rng)
        if self is NullModel.BIGRAM_MARKOV:
            return bigram_markov(motor, rng)
        raise NotImplementedError(f"{self.value!r} not implemented until Sprint 7d")
