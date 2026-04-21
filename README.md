# tanakh-gematria

Microservicio standalone: corpus hebreo (Tanaj via Sefaria-Export) + índice de Gematria + API de consulta.

Responsabilidad única: dado un valor numérico `Gs` (o par `Gs+Milui`), devolver todas las palabras del Tanaj que colisionan con ese valor, con contexto de verso completo.

---

## Estructura

```
tanakh-gematria/
├── main.py                        # uvicorn entrypoint (minimalista)
├── requirements.txt
├── data/
│   ├── raw/                       # Sefaria-Export clonado aquí o symlink
│   └── processed/                 # tanakh.db (SQLite)
├── scripts/
│   └── ingest.py                  # CLI de ingesta
└── src/
    ├── logic/
    │   └── gematria.py            # Mispar Hechrechi + Milui + normalización
    ├── infrastructure/
    │   ├── schema.py              # SQLAlchemy models: Book, Verse, Word
    │   └── ingestion.py           # Pipeline Sefaria-Export → SQLite
    └── api/
        └── routes.py              # FastAPI endpoints
```

---

## Setup

```bash
git clone https://github.com/Sefaria/Sefaria-Export data/raw/Sefaria-Export
pip install -r requirements.txt

# Ingestar (solo Torá primero para validar, ~5 libros)
python -m scripts.ingest \
  --source data/raw/Sefaria-Export/json/Tanakh \
  --db sqlite:///data/processed/tanakh.db

# Con Milui (más lento, opcional)
python -m scripts.ingest --source ... --milui

# Levantar API
python main.py
```

---

## Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/words/by-gs?value=N` | Palabras con Gs = N |
| GET | `/words/by-gs-milui?gs=N&milui=M` | Palabras con Gs=N y Milui=M |
| GET | `/words/{id}` | Palabra + contexto de verso |
| GET | `/verses/{id}` | Verso completo + metadatos de libro |

---

## Integración con hermeneutica_app

Este servicio expone el "índice de colisiones numéricas". `hermeneutica_app` lo consume en su **Capa de Mapeo Simbólico-Numérico**: dado un nombre/término → Gs → `GET /words/by-gs?value={Gs}` → lista de candidatos sobre los que se aplica `D_sem`.

Puerto por defecto: `8001` (separado del app principal).

---

## Decisiones de diseño

- **Fuente**: Sefaria-Export (snapshot versionado, no API en runtime).
- **Gematria base**: Mispar Hechrechi (Gs). Milui como feature opcional en ingesta.
- **Normalización**: strip niqqud + cantilación (U+0591–U+05C7), letras finales → estándar.
- **Granularidad**: Palabra como unidad mínima, Verso como contexto. `Words.verse_id` FK.
- **DB**: SQLite en MVP; schema SQLAlchemy portable a Postgres sin cambios.
