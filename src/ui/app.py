"""Streamlit UI — ELS Monte Carlo experiment runner.

Launch:
    streamlit run src/ui/app.py

Motor is cached per corpus stream via @st.cache_resource (build ~700ms once
per session). run_experiment() runs in the main thread; st.progress updates
synchronously between iterations via the progress callback.
"""
import sys
import matplotlib.pyplot as plt
import streamlit as st
from pathlib import Path

# Ensure project root is on sys.path regardless of launch CWD.
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import pandas as pd

from src.logic.corpus.builder import build_motor
from src.logic.els.search import locate_matches
from src.logic.stats.monte_carlo import run_experiment
from src.logic.stats.null_models import NullModel

_MATCH_LIMIT = 1000

_DATA = Path(__file__).resolve().parents[2] / "data" / "processed"
_DB = {
    "ketiv": _DATA / "tanakh.db",
    "qere":  _DATA / "tanakh_qere.db",
}
_IMPLEMENTED = [NullModel.LETTER_SHUFFLE, NullModel.BIGRAM_MARKOV]


@st.cache_resource
def _load_motor(stream: str):
    db = _DB[stream]
    if not db.exists():
        st.error(f"DB not found: {db}")
        st.stop()
    return build_motor(db)


# ── Sidebar ──────────────────────────────────────────────────────────────────

st.title("ELS Monte Carlo — Equidistancia")

with st.sidebar:
    st.header("Experiment parameters")
    target = st.text_input("Target (Hebrew consonants)", "תורה")
    skip_min = st.number_input("skip_min", min_value=2, max_value=10_000, value=2, step=1)
    skip_max = st.number_input("skip_max", min_value=2, max_value=10_000, value=100, step=1)
    null_model_val = st.selectbox("Null model", [m.value for m in _IMPLEMENTED])
    iterations = st.number_input("Iterations", min_value=1, max_value=10_000, value=100, step=1)
    seed = st.number_input("Seed", min_value=0, max_value=2**31 - 1, value=42, step=1)
    stream = st.radio("Corpus stream", ["ketiv", "qere"])

# ── Main flow ─────────────────────────────────────────────────────────────────

if st.button("Run experiment", type="primary"):
    if not target.strip():
        st.error("Target is required.")
        st.stop()
    if skip_min > skip_max:
        st.error("skip_min must be ≤ skip_max.")
        st.stop()

    motor, offset_map = _load_motor(stream)
    null_model = NullModel(null_model_val)
    skip_range = range(int(skip_min), int(skip_max) + 1)

    bar = st.progress(0.0, text="Running Monte Carlo…")

    def _progress(i: int, n: int) -> None:
        bar.progress(i / n, text=f"Iteration {i} / {n}")

    result = run_experiment(
        motor, target, skip_range, null_model, int(iterations),
        seed=int(seed), progress=_progress,
    )
    bar.empty()

    # ── Metrics ───────────────────────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Observed count", result.observed_count)
    c2.metric("Null mean", f"{result.null_mean:.2f}")
    c3.metric("z-score", f"{result.z_score:.4f}")
    c4.metric("p-value", f"{result.p_value:.6f}")

    # ── Histogram ─────────────────────────────────────────────────────────────
    fig, ax = plt.subplots(figsize=(8, 3))
    ax.hist(result.null_counts, bins=20, color="steelblue", alpha=0.85, edgecolor="white")
    ax.axvline(result.observed_count, color="crimson", linewidth=2,
               label=f"observed = {result.observed_count}")
    ax.set_xlabel("ELS match count (null distribution)")
    ax.set_ylabel("Frequency")
    ax.set_title(
        f"Null distribution — {null_model.value}  |  target={target}  "
        f"skip=[{skip_min},{skip_max}]  N={iterations}  seed={seed}"
    )
    ax.legend()
    fig.tight_layout()
    st.pyplot(fig)
    plt.close(fig)

    # ── Match locations ────────────────────────────────────────────────────────
    if result.observed_count > 0:
        rows, truncated = locate_matches(
            motor, offset_map, target, skip_range, limit=_MATCH_LIMIT
        )
        label = (
            f"Ver los primeros {_MATCH_LIMIT} matches (de {result.observed_count})"
            if truncated
            else f"Ver los {result.observed_count} matches"
        )
        with st.expander(label, expanded=False):
            if truncated:
                st.warning(
                    f"Mostrando los primeros {_MATCH_LIMIT} de {result.observed_count} matches. "
                    "Reduce el skip_range o usa un target más largo para ver todos."
                )
            df = pd.DataFrame(rows).sort_values("skip").reset_index(drop=True)
            st.dataframe(df, use_container_width=True)
