# hermeneutica_app — Arquitectura RAG Local

## Qué

Pipeline RAG (Retrieval-Augmented Generation) completo ejecutándose enteramente en hardware local (Apple Silicon/MPS), sin dependencias de APIs externas ni frameworks monolíticos. Seis módulos con responsabilidad única que transforman documentos crudos (PDF/TXT) en respuestas contextualizadas a través de Llama 3.2 3B Instruct.

## Por qué no LangChain

LangChain introduce ~40 dependencias transitivas, abstracciones opacas (LCEL/RunnableSequence) y surface area de breaking changes significativa para un pipeline que es fundamentalmente lineal: `ingest → chunk → embed → store → retrieve → augment → generate`. El control explícito sobre cada etapa permite: debugging sin capas de indirección, gestión precisa del presupuesto de tokens, y alineación directa con los principios PDE (un módulo = una responsabilidad). La complejidad accidental de LangChain no se justifica cuando el flujo cabe en ~300 líneas de orquestación total.

## Árbol de Módulos

```
hermeneutica_app/
├── src/
│   ├── main.py                         # REPL + wiring. Cero lógica.
│   ├── logic/
│   │   ├── etl.py                      # Pipeline: raw → vectordb
│   │   ├── chunking.py                 # DocumentFragment → Chunk[]
│   │   ├── context_manager.py          # Presupuesto de ventana de contexto
│   │   └── retrieval.py                # Query → RAGResult
│   ├── infrastructure/
│   │   ├── document_loader.py          # I/O: PDF/TXT → DocumentFragment
│   │   ├── embeddings.py               # sentence-transformers wrapper
│   │   ├── vector_store.py             # ChromaDB CRUD + similarity search
│   │   └── llm_engine.py              # Llama inference + token counting
│   └── data/
│       ├── raw/                        # Documentos fuente
│       └── vectordb/                   # ChromaDB persistido
└── requirements.txt
```

## Flujo de Datos

```
[PDF/TXT] → document_loader → [DocumentFragment]
                                     ↓
                               chunking.py → [Chunk] (512 chars, 80 overlap)
                                     ↓
                              embeddings.py → [vector 384d]
                                     ↓
                             vector_store.py → ChromaDB (disco)
                                     ↓ (en query time)
                             retrieval.py ← user_query
                                     ↓
                          context_manager.py → budget allocation
                                     ↓
                             llm_engine.py → respuesta generada
```

## Variables Críticas

**`max_context_tokens = 8192`** — Llama 3.2 3B soporta hasta 128K tokens teóricos. En la práctica, el KV cache en MPS escala linealmente con la longitud de secuencia. Con el modelo en bfloat16 (~6GB), una MacBook con 16GB de RAM unificada colapsa alrededor de 16K-24K tokens dependiendo de la carga del sistema. El default de 8192 deja margen operativo amplio. Si tienes 32GB+, puedes subir a 16384 monitorizando con `sudo powermetrics --samplers gpu_power`.

**`chunk_size = 512 chars`** — Balanceo entre granularidad de retrieval (chunks más pequeños = mayor precisión en matching) y coherencia semántica (chunks más grandes = menos fragmentación de ideas). 512 es el consenso empírico para textos académicos/filosóficos donde los párrafos son densos.

**`chunk_overlap = 80 chars`** — ~15% del chunk_size. Previene pérdida de contexto en fronteras de párrafo. Sin overlap, una pregunta sobre un concepto que cruza dos chunks podría no matchear ninguno con suficiente score.

**`top_k = 6`** — Chunks recuperados antes del budget cut. El context_manager recorta a los que caben. Pedir más de 6 con chunks de 512 chars ya satura ~4K tokens de contexto, dejando espacio justo para system prompt + query + generation.

**`generation_budget = 1024`** — Tokens reservados para la respuesta del modelo. Para análisis hermenéutico, respuestas de ~750 palabras son suficientes. Aumentar implica comprimir el espacio de contexto RAG.

## Decisiones de Diseño

**ChromaDB sobre FAISS**: Persistencia nativa a disco sin serialización manual, filtrado por metadata (`where` clauses), y API de colecciones. FAISS requiere pickle/numpy para persistir y no soporta metadata filtering. Trade-off: ~15% más lento en búsqueda bruta a escala <100K — irrelevante para un corpus de textos hermenéuticos.

**Embedding multilingüe (paraphrase-multilingual-MiniLM-L12-v2)**: 384 dimensiones, ~471M params. Soporta ES/EN/HE nativo. Alternativa: BAAI/bge-m3 (1024 dims) con mejor calidad pero 2.6x más VRAM por embedding y búsqueda más costosa en ChromaDB.

**Lazy loading en todos los motores**: Ni embeddings ni LLM se cargan hasta el primer uso. Esto permite importar los módulos sin coste de memoria y facilita testing con mocks.

## Ejecución

```bash
# 1. Instalar dependencias en venv
pip install -r requirements.txt

# 2. ETL: ingestar corpus
python -m hermeneutica_app.src.logic.etl --source ./src/data/raw

# 3. REPL interactivo
python -m hermeneutica_app.src.main --model ./models/llama-3.2-3b
```

## Próximos Pasos (Trigger para Siguientes Iteraciones)

El pipeline actual es **retrieval naïve** (similarity search directa). Las extensiones naturales son: re-ranking con cross-encoder post-retrieval (mejora precision@k ~20-30% según MTEB benchmarks), query decomposition para preguntas compuestas, y persistent conversation memory con buffer rotativo que inyecte los últimos N turnos como contexto adicional al ContextBudget.
