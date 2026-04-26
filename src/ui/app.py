"""Streamlit UI — ELS explorer (Search + Extract modes).

Launch:
    streamlit run src/ui/app.py

Search mode: Monte Carlo over skip range, null distribution, observed count, p-value.
Extract mode: read letters at (start, skip, length) without predefined target.

Motor is cached per corpus stream via @st.cache_resource (build ~700ms once
per session).
"""
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

from src.logic.corpus.builder import build_motor
from src.logic.corpus.resolver import locate_inverse
from src.logic.els.extract import extract_sequence, locate_extract
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


# ── Shared header + mode/stream selection ────────────────────────────────────

st.title("ELS Explorer — Equidistancia")

with st.sidebar:
    mode = st.radio("Mode", ["Search", "Extract"], horizontal=True)
    stream = st.radio("Corpus stream", ["ketiv", "qere"])

motor, offset_map = _load_motor(stream)
n = len(motor)

with st.expander("¿Cómo funciona el motor consonantal?", expanded=False):
    st.markdown(
        """
**El motor** es el Tanaj reducido a un único stream de consonantes en orden canónico
(Génesis → Crónicas II). 1,197,518 letras para ketiv. **No incluye**:

- **Vocalización** (נִקּוּד) — los puntos arriba o abajo de cada letra.
- **Cantilación** (טְעָמִים) — las rayitas o marcas musicales.
- **Maqaf** (־) — el guión que une palabras como en `אֶת־`. No cuenta como letra.
- **Espacios, separadores, signos de puntuación.**
- **Letras finales** — colapsan a su base: ך→כ, ם→מ, ן→נ, ף→פ, ץ→צ.

**ELS** (Equidistant Letter Sequences) busca patrones en este stream: letras separadas
por un `skip` fijo. Si skip = 65, la letra 1 está en motor_pos X, la 2 en X+65, la 3
en X+130, etc. El pattern puede cruzar fronteras de palabra, versículo, capítulo o libro.

**Para verificar un match en Sefaria**: abre el versículo indicado en la tabla de
resultados, desactiva *Vocalization* y *Cantillation* en el menú de display (icono Aa),
y cuenta **solo consonantes de derecha a izquierda**, ignorando todos los signos.
        """
    )

# ═══════════════════════════════════════════════════════════════════════════
# SEARCH MODE — Monte Carlo experiment
# ═══════════════════════════════════════════════════════════════════════════

if mode == "Search":
    with st.sidebar:
        st.header("Search parameters")
        target = st.text_input(
            "Target (Hebrew consonants)", "תורה",
            help="Palabra a buscar. Solo consonantes. Finales se colapsan (ף→פ, etc).",
        )
        skip_min = st.number_input(
            "skip_min", min_value=-10_000, max_value=10_000, value=2, step=1,
            help="Mínimo salto. Negativo busca el target invertido (Forma B). ELS busca en [skip_min, skip_max].",
        )
        skip_max = st.number_input(
            "skip_max", min_value=-10_000, max_value=10_000, value=100, step=1,
            help=(
                "Máximo skip. Barrido amplio descubre más patterns pero sube el conteo esperado "
                "por chance. Referencias: WRR `תורה` a skip=50; אינסוף ketiv a skip=65, 196, 350, 453, 739, 849, 966."
            ),
        )
        null_model_val = st.selectbox("Null model", [m.value for m in _IMPLEMENTED])
        iterations = st.number_input("Iterations", min_value=1, max_value=10_000, value=100, step=1)
        seed = st.number_input("Seed", min_value=0, max_value=2**31 - 1, value=42, step=1)

    if st.button("Run experiment", type="primary"):
        if not target.strip():
            st.error("Target is required.")
            st.stop()
        if skip_min > skip_max:
            st.error("skip_min must be ≤ skip_max.")
            st.stop()

        null_model = NullModel(null_model_val)
        skip_range = range(int(skip_min), int(skip_max) + 1)

        bar = st.progress(0.0, text="Running Monte Carlo…")

        def _progress(i: int, total: int) -> None:
            bar.progress(i / total, text=f"Iteration {i} / {total}")

        result = run_experiment(
            motor, target, skip_range, null_model, int(iterations),
            seed=int(seed), progress=_progress,
        )
        bar.empty()

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Observed count", result.observed_count)
        c2.metric("Null mean", f"{result.null_mean:.2f}")
        c3.metric("z-score", f"{result.z_score:.4f}")
        c4.metric("p-value", f"{result.p_value:.6f}")

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
                df["first_sefaria"] = df.apply(
                    lambda r: f"https://www.sefaria.org/{r['first_book'].replace(' ', '_')}.{r['first_ref'].replace(':', '.')}?lang=he",
                    axis=1,
                )
                df["last_sefaria"] = df.apply(
                    lambda r: f"https://www.sefaria.org/{r['last_book'].replace(' ', '_')}.{r['last_ref'].replace(':', '.')}?lang=he",
                    axis=1,
                )
                st.dataframe(
                    df,
                    use_container_width=True,
                    column_config={
                        "first_sefaria": st.column_config.LinkColumn("first_url", display_text="abrir"),
                        "last_sefaria":  st.column_config.LinkColumn("last_url",  display_text="abrir"),
                    },
                )

# ═══════════════════════════════════════════════════════════════════════════
# EXTRACT MODE — read sequence without predefined target
# ═══════════════════════════════════════════════════════════════════════════

elif mode == "Extract":
    st.caption(
        "Lee la secuencia de letras en posiciones equidistantes sin target predefinido. "
        "**Modo exploratorio — no hay null model.** Cualquier (start, skip, length) "
        "produce una cadena de letras; en hebreo consonantal, secuencias cortas casi "
        "siempre parecen palabras por densidad léxica (McKay et al. 1999, Statistical "
        "Science 14(2) §3). Ausencia de z/p es deliberada."
    )

    with st.sidebar:
        st.header("Extract parameters")
        input_mode = st.radio(
            "Position input",
            ["Motor position", "Book reference"],
            help=(
                "Motor position = índice crudo (0..|motor|-1). "
                "Book reference = libro + capítulo:versículo + offset de letra."
            ),
        )

        start_pos: int | None
        if input_mode == "Motor position":
            start_pos = int(st.number_input(
                "start_pos", min_value=0, max_value=n - 1, value=0, step=1
            ))
        else:
            books = list(dict.fromkeys(w.book_en for w in offset_map))
            book = st.selectbox("Book", books)
            chapter = st.number_input("Chapter", min_value=1, value=1, step=1)
            verse = st.number_input("Verse", min_value=1, value=1, step=1)
            letter_offset = st.number_input("Letter offset in verse", min_value=0, value=0, step=1)
            try:
                start_pos = locate_inverse(
                    offset_map, book, int(chapter), int(verse), int(letter_offset)
                )
                st.caption(f"→ motor_pos = {start_pos}")
            except ValueError as e:
                st.error(str(e))
                start_pos = None

        skip = int(st.number_input(
            "skip (signed, ≠ 0)", value=50, step=1,
            help=(
                "Saltos entre letras consecutivas del pattern. Positivo = forward, negativo = backward. "
                "Consonantes puras: ignora maqaf (־), vowels y cantilación."
            ),
        ))
        length = int(st.number_input(
            "length", min_value=1, max_value=100, value=10, step=1,
            help="Número de letras a extraer.",
        ))

    if st.button("Extract", type="primary"):
        if start_pos is None:
            st.error("Resuelve una posición válida antes de extraer.")
            st.stop()
        try:
            result = extract_sequence(motor, start_pos, skip, length)
        except ValueError as e:
            st.error(str(e))
            st.stop()

        st.subheader("Sequence")
        st.markdown(
            f"<div style='font-size:3em; direction:rtl; text-align:center; "
            f"font-family:\"SBL Hebrew\",\"Times New Roman\",serif'>{result.text}</div>",
            unsafe_allow_html=True,
        )

        refs = locate_extract(offset_map, result)
        df = pd.DataFrame([
            {
                "i":         i,
                "letter":    r.letter,
                "motor_pos": r.motor_pos,
                "book":      r.book_en,
                "ref":       r.ref,
                "sefaria":   (
                    f"https://www.sefaria.org/{r.book_en.replace(' ', '_')}."
                    f"{r.ref.replace(':', '.')}?lang=he"
                ),
            }
            for i, r in enumerate(refs)
        ])
        st.dataframe(
            df,
            use_container_width=True,
            column_config={
                "sefaria": st.column_config.LinkColumn("Sefaria", display_text="abrir"),
            },
        )

        with st.expander("¿Cómo verifico cada letra en Sefaria?", expanded=False):
            st.markdown(
                """
1. Click el link **Sefaria** de la fila (columna derecha). Abre el versículo correspondiente.
2. En Sefaria, icono **Aa** arriba a la derecha → desactiva **Vocalization** y **Cantillation**.
   El texto queda limpio, solo consonantes.
3. Cuenta palabras **de derecha a izquierda** (hebreo lee RTL; la primera palabra está arriba a la derecha).
4. Dentro de la palabra correcta, cuenta letras **también de derecha a izquierda** hasta la posición de la letra.

**No cuentan**: vocalización (puntos), cantilación (rayitas), maqaf (־), espacios, separadores
`{פ}` `{ס}` de aliyot.
**Las finales valen como su base**: ך=כ, ם=מ, ן=נ, ף=פ, ץ=צ. Si la letra visual en Sefaria es final,
es la misma que la base que muestra la tabla.
                """
            )
