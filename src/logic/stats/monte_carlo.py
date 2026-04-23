"""Monte Carlo experiment runner for ELS significance testing (Sprint 7b).

Given a target and skip range, computes observed match count on the real motor
and a null distribution of N counts under a chosen null model. Emits z-score,
mean/std of null, and empirical p-value (one-sided, add-one smoothed per North
et al., 2002, "A note on the calculation of empirical P values from Monte Carlo
procedures", Am. J. Hum. Genet. 71(2): 439-441 — prevents p=0 for extreme obs).

References:
  Witztum, Rips, Rosenberg (1994), "Equidistant Letter Sequences in the Book
    of Genesis", Statistical Science 9(3): 429-438.
  McKay, Bar-Natan, Bar-Hillel, Kalai (1999), "Solving the Bible Code Puzzle",
    Statistical Science 14(2): 150-173.

Reproducibility: all N per-iteration RNGs derive from np.random.SeedSequence(seed)
via .spawn(N). Same seed → bit-identical null_counts. Stdlib alternative would
be random.Random seeding, but SeedSequence is the numpy standard for MC work and
composes with the rest of the stats pipeline that already uses np.random.Generator.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np

from src.logic.els.search import els_search
from src.logic.stats.null_models import NullModel


@dataclass(frozen=True, slots=True)
class ExperimentResult:
    """Result of a Monte Carlo null-distribution experiment over ELS counts.

    All count-level fields are raw integers; statistical summaries are derived
    properties so consumers can choose alternative test statistics without
    recomputing the expensive null simulation.
    """
    target: str
    skip_range: range
    null_model: NullModel
    n_iterations: int
    observed_count: int
    null_counts: tuple[int, ...]

    @property
    def null_mean(self) -> float:
        return float(np.mean(self.null_counts))

    @property
    def null_std(self) -> float:
        return float(np.std(self.null_counts, ddof=1))

    @property
    def z_score(self) -> float:
        s = self.null_std
        if s == 0.0:
            return float("inf") if self.observed_count > self.null_mean else 0.0
        return (self.observed_count - self.null_mean) / s

    @property
    def p_value(self) -> float:
        """One-sided empirical p-value with add-one smoothing.

        p = (#{null_i >= observed} + 1) / (N + 1). The +1 avoids p=0 for
        extreme observations where no null iteration exceeded observed
        (North et al., 2002).
        """
        arr = np.asarray(self.null_counts, dtype=np.int64)
        exceed = int(np.sum(arr >= self.observed_count))
        return (exceed + 1) / (len(arr) + 1)


def _count_matches(motor: bytes, target: str, skip_range: range) -> int:
    """Count ELS matches without materializing the iterator's results."""
    return sum(1 for _ in els_search(motor, target, skip_range))


def run_experiment(
    motor: bytes,
    target: str,
    skip_range: range,
    null_model: NullModel,
    n_iterations: int,
    seed: int = 0,
    progress: Callable[[int, int], None] | None = None,
) -> ExperimentResult:
    """Run Monte Carlo null-distribution experiment.

    Args:
        motor: real consonantal motor (bytes of letter indices 0-21).
        target: hebrew target word; encoded internally by els_search.
        skip_range: signed skip values to search; must not include 0.
        null_model: which null to use for shuffling.
        n_iterations: N iterations of shuffle+count.
        seed: master seed; N child RNGs derived via SeedSequence.spawn(N).
        progress: optional callback(i, N) called after each iteration.

    Returns:
        ExperimentResult with observed_count, null_counts, and derived stats.
    """
    observed = _count_matches(motor, target, skip_range)

    seq = np.random.SeedSequence(seed)
    child_seqs = seq.spawn(n_iterations)

    null_counts: list[int] = []
    for i, child in enumerate(child_seqs):
        rng = np.random.default_rng(child)
        shuffled = null_model.apply(motor, rng)
        null_counts.append(_count_matches(shuffled, target, skip_range))
        if progress is not None:
            progress(i + 1, n_iterations)

    return ExperimentResult(
        target=target,
        skip_range=skip_range,
        null_model=null_model,
        n_iterations=n_iterations,
        observed_count=observed,
        null_counts=tuple(null_counts),
    )
