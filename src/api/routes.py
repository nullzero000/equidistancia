from fastapi import FastAPI, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from src.infrastructure.schema import Word, Verse, get_engine
from src.logic.temurah import all_transforms, gs_after_transform, transform
from src.logic.shoresh import extract
from src.api.state import lifespan
from src.api.routers.els import router as els_router

app = FastAPI(title="Tanakh Gematria Service", version="0.3.0", lifespan=lifespan)
app.include_router(els_router, prefix="/els", tags=["els"])


def get_session():
    engine = get_engine()
    with Session(engine) as session:
        yield session


class WordOut(BaseModel):
    id: int
    normalized: str
    gs: int
    milui: int | None
    shoresh: str | None
    verse_id: int
    position: int
    model_config = {"from_attributes": True}


class VerseContext(BaseModel):
    book_en: str
    book_he: str
    chapter: int
    verse: int
    text_he: str


class WordWithContext(WordOut):
    context: VerseContext


class VerseOut(BaseModel):
    id: int
    chapter: int
    verse: int
    text_he: str
    book_en: str
    book_he: str


class TemurahResult(BaseModel):
    method: str
    transformed: str
    gs: int
    collisions: list[WordOut]


# ── Gs directo ───────────────────────────────────────────────────────────────

@app.get("/words/by-gs", response_model=list[WordOut])
def words_by_gs(
    value: int = Query(..., gt=0),
    limit: int = Query(50, le=500),
    session: Session = Depends(get_session),
):
    return session.query(Word).filter(Word.gs == value).limit(limit).all()


@app.get("/words/by-gs-milui", response_model=list[WordOut])
def words_by_gs_milui(
    gs: int = Query(..., gt=0),
    milui: int = Query(..., gt=0),
    limit: int = Query(50, le=500),
    session: Session = Depends(get_session),
):
    return (
        session.query(Word)
        .filter(Word.gs == gs, Word.milui == milui)
        .limit(limit)
        .all()
    )


# ── Temurah ──────────────────────────────────────────────────────────────────

@app.get("/words/by-temurah", response_model=list[TemurahResult])
def words_by_temurah(
    word: str = Query(...),
    method: str = Query("all", description="atbash | albam | avgad | all"),
    limit: int = Query(20, le=200),
    session: Session = Depends(get_session),
):
    methods = ["atbash", "albam", "avgad"] if method == "all" else [method]
    results = []
    for m in methods:
        gs_val = gs_after_transform(word, m)
        transformed = transform(word, m)
        collisions = session.query(Word).filter(Word.gs == gs_val).limit(limit).all()
        results.append(TemurahResult(
            method=m, transformed=transformed, gs=gs_val, collisions=collisions,
        ))
    return results


@app.get("/words/temurah-values")
def temurah_values(word: str = Query(...)):
    return all_transforms(word)


# ── Shoresh ──────────────────────────────────────────────────────────────────

@app.get("/words/by-shoresh", response_model=list[WordOut])
def words_by_shoresh(
    root: str = Query(..., description="Palabra o raíz — se extrae el stem"),
    limit: int = Query(50, le=500),
    session: Session = Depends(get_session),
):
    stem = extract(root)
    return session.query(Word).filter(Word.shoresh == stem).limit(limit).all()


@app.get("/words/shoresh-info")
def shoresh_info(word: str = Query(...)):
    return {"input": word, "shoresh": extract(word)}


@app.get("/words/share-root")
def words_share_root(word1: str = Query(...), word2: str = Query(...)):
    s1, s2 = extract(word1), extract(word2)
    return {"word1": word1, "shoresh1": s1, "word2": word2, "shoresh2": s2, "share_root": s1 == s2}


# ── Análisis completo ─────────────────────────────────────────────────────────

@app.get("/analyze")
def analyze(
    word: str = Query(...),
    limit: int = Query(10, le=100),
    session: Session = Depends(get_session),
):
    from src.logic.gematria import gs as calc_gs

    stem = extract(word)
    gs_val = calc_gs(word)
    temurah = all_transforms(word)

    def fetch(gs_v: int) -> list[dict]:
        rows = session.query(Word).filter(Word.gs == gs_v).limit(limit).all()
        return [WordOut.model_validate(w).model_dump() for w in rows]

    return {
        "input": word,
        "gs": gs_val,
        "shoresh": stem,
        "temurah": temurah,
        "collisions": {
            "by_gs":      fetch(gs_val),
            "by_atbash":  fetch(temurah["atbash"]["gs"]),
            "by_albam":   fetch(temurah["albam"]["gs"]),
            "by_avgad":   fetch(temurah["avgad"]["gs"]),
            "by_shoresh": [
                WordOut.model_validate(w).model_dump()
                for w in session.query(Word).filter(Word.shoresh == stem).limit(limit).all()
            ],
        },
    }


# ── Detalle ───────────────────────────────────────────────────────────────────

@app.get("/words/{word_id}", response_model=WordWithContext)
def word_detail(word_id: int, session: Session = Depends(get_session)):
    word = (
        session.query(Word)
        .options(joinedload(Word.verse).joinedload(Verse.book))
        .filter(Word.id == word_id)
        .first()
    )
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    return WordWithContext(
        **WordOut.model_validate(word).model_dump(),
        context=VerseContext(
            book_en=word.verse.book.name_en,
            book_he=word.verse.book.name_he,
            chapter=word.verse.chapter,
            verse=word.verse.verse,
            text_he=word.verse.text_he,
        ),
    )


@app.get("/verses/{verse_id}", response_model=VerseOut)
def verse_detail(verse_id: int, session: Session = Depends(get_session)):
    verse = (
        session.query(Verse)
        .options(joinedload(Verse.book))
        .filter(Verse.id == verse_id)
        .first()
    )
    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")
    return VerseOut(
        id=verse.id, chapter=verse.chapter, verse=verse.verse,
        text_he=verse.text_he,
        book_en=verse.book.name_en, book_he=verse.book.name_he,
    )
