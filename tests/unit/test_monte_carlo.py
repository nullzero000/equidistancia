"""Property tests for Monte Carlo experiment runner.

Uses a small synthetic motor (~11k bytes) so tests run in <5s. Statistical
properties (z-score, p-value smoothing) are verified against hand-computed
expected values using the same RNG seeds for reproducibility.
"""
import numpy as np
import pytest

from src.logic.corpus.encoding import encode
from src.logic.stats.monte_carlo import ExperimentResult, run_experiment
from src.logic.stats.null_models import NullModel

# Small synthetic motor: 500 × 22-letter Hebrew alphabet = 11,000 bytes.
# Contains plenty of ELS opportunities for short targets at short skips.
MOTOR: bytes = encode("אבגדהוזחטיכלמנסעפצקרשת" * 500)
TARGET = "אבג"
SKIPS = range(2, 50)


def test_result_is_dataclass():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 20, seed=42)
    assert isinstance(res, ExperimentResult)
    assert res.n_iterations == 20
    assert len(res.null_counts) == 20
    assert res.target == TARGET
    assert res.null_model is NullModel.LETTER_SHUFFLE


def test_observed_count_nonneg():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 10, seed=42)
    assert res.observed_count >= 0


def test_null_counts_nonneg():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 10, seed=42)
    for c in res.null_counts:
        assert c >= 0


def test_p_value_bounded_with_smoothing():
    """p ∈ (0, 1]. Lower bound is strictly positive thanks to add-one smoothing."""
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 50, seed=42)
    assert 0 < res.p_value <= 1


def test_p_value_smoothing_formula():
    """p = (#{null >= obs} + 1) / (N + 1)."""
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 30, seed=42)
    arr = np.asarray(res.null_counts)
    expected = (int(np.sum(arr >= res.observed_count)) + 1) / (len(arr) + 1)
    assert abs(res.p_value - expected) < 1e-12


def test_z_score_formula():
    """z = (observed - null_mean) / null_std (sample std, ddof=1)."""
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 50, seed=42)
    arr = np.asarray(res.null_counts, dtype=np.float64)
    expected = (res.observed_count - arr.mean()) / arr.std(ddof=1)
    assert abs(res.z_score - expected) < 1e-9


def test_reproducibility_same_seed():
    r1 = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 15, seed=42)
    r2 = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 15, seed=42)
    assert r1.null_counts == r2.null_counts
    assert r1.observed_count == r2.observed_count
    assert r1.p_value == r2.p_value


def test_different_seeds_differ():
    r1 = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 15, seed=1)
    r2 = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 15, seed=2)
    assert r1.null_counts != r2.null_counts


def test_bigram_markov_null_also_works():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.BIGRAM_MARKOV, 10, seed=42)
    assert len(res.null_counts) == 10
    assert res.null_model is NullModel.BIGRAM_MARKOV


def test_residue_class_not_implemented_raises():
    with pytest.raises(NotImplementedError):
        run_experiment(MOTOR, TARGET, SKIPS, NullModel.RESIDUE_CLASS, 5, seed=42)


def test_book_permutation_not_implemented_raises():
    with pytest.raises(NotImplementedError):
        run_experiment(MOTOR, TARGET, SKIPS, NullModel.BOOK_PERMUTATION, 5, seed=42)


def test_progress_callback_invoked_n_times():
    calls: list[tuple[int, int]] = []
    run_experiment(
        MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 7, seed=42,
        progress=lambda i, n: calls.append((i, n)),
    )
    assert len(calls) == 7
    assert calls[0] == (1, 7)
    assert calls[-1] == (7, 7)


def test_null_mean_is_mean():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 30, seed=42)
    assert abs(res.null_mean - float(np.mean(res.null_counts))) < 1e-12


def test_null_std_uses_ddof_1():
    res = run_experiment(MOTOR, TARGET, SKIPS, NullModel.LETTER_SHUFFLE, 30, seed=42)
    assert abs(res.null_std - float(np.std(res.null_counts, ddof=1))) < 1e-12
