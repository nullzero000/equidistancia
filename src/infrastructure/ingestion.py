import json
import logging
import re
from pathlib import Path

from sqlalchemy.orm import Session

from src.infrastructure.schema import Book, Verse, Word, get_engine, init_db
from src.logic.gematria import gs, milui, normalize, strip_niqqud

logger = logging.getLogger(__name__)

BOOK_ORDER: list[tuple[str, str]] = [
    ("Genesis","בראשית"),("Exodus","שמות"),("Leviticus","ויקרא"),
    ("Numbers","במדבר"),("Deuteronomy","דברים"),("Joshua","יהושע"),
    ("Judges","שופטים"),("I Samuel","שמואל א"),("II Samuel","שמואל ב"),
    ("I Kings","מלכים א"),("II Kings","מלכים ב"),("Isaiah","ישעיהו"),
    ("Jeremiah","ירמיהו"),("Ezekiel","יחזקאל"),("Hosea","הושע"),
    ("Joel","יואל"),("Amos","עמוס"),("Obadiah","עובדיה"),("Jonah","יונה"),
    ("Micah","מיכה"),("Nahum","נחום"),("Habakkuk","חבקוק"),
    ("Zephaniah","צפניה"),("Haggai","חגי"),("Zechariah","זכריה"),
    ("Malachi","מלאכי"),("Psalms","תהלים"),("Proverbs","משלי"),
    ("Job","איוב"),("Song of Songs","שיר השירים"),("Ruth","רות"),
    ("Lamentations","איכה"),("Ecclesiastes","קהלת"),("Esther","אסתר"),
    ("Daniel","דניאל"),("Ezra","עזרא"),("Nehemiah","נחמיה"),
    ("I Chronicles","דברי הימים א"),("II Chronicles","דברי הימים ב"),
]

_HTML_TAG     = re.compile(r"<[^>]+>")
_HTML_ENTITY  = re.compile(r"&\w+;")
_PARASHA_MARK = re.compile(r"\{[פסרנ]\}")
_NON_HEBREW = re.compile(r"[^\u05D0-\u05EA]")
_WORD_SEP   = re.compile(r"[\s\u05BE\u05C0\u05C3\u05C6]+")
# whitespace | maqaf (U+05BE) | paseq (U+05C0) | sof-pasuq (U+05C3) | nun-hafucha (U+05C6)


def _clean(text: str) -> str:
    text = _HTML_TAG.sub("", text)
    text = _HTML_ENTITY.sub("", text)
    text = _PARASHA_MARK.sub("", text)
    return text


def _tokenize(verse_text: str) -> list[str]:
    clean = _clean(verse_text)
    tokens = []
    for token in _WORD_SEP.split(clean):
        hebrew_only = _NON_HEBREW.sub("", token)
        if hebrew_only:
            tokens.append(hebrew_only)
    return tokens


def ingest_book(
    session: Session,
    path: Path,
    book_name_en: str,
    book_name_he: str,
    order: int,
    compute_milui: bool = False,
) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    chapters_raw = data.get("text", [])

    book = Book(name_en=book_name_en, name_he=book_name_he, order=order)
    session.add(book)
    session.flush()

    for chap_idx, chapter in enumerate(chapters_raw, start=1):
        if not isinstance(chapter, list):
            chapter = [chapter]
        for verse_idx, verse_text in enumerate(chapter, start=1):
            if not verse_text:
                continue

            verse = Verse(
                book_id=book.id,
                chapter=chap_idx,
                verse=verse_idx,
                text_he=_clean(verse_text),
            )
            session.add(verse)
            session.flush()

            for pos, token in enumerate(_tokenize(verse_text)):
                norm = normalize(token)
                if len(norm) < 2:  # descartar tokens de 1 letra (prefijos sueltos)
                    continue
                session.add(Word(
                    verse_id=verse.id,
                    position=pos,
                    form_he=strip_niqqud(token),
                    normalized=norm,
                    gs=gs(norm),
                    milui=milui(norm) if compute_milui else None,
                ))

    logger.info("Ingested: %s", book_name_en)


def run(
    source_dir: str,
    db_url: str = "sqlite:///data/processed/tanakh.db",
    compute_milui: bool = False,
) -> None:
    engine = get_engine(db_url)
    init_db(engine)
    source = Path(source_dir)

    with Session(engine) as session:
        for order, (name_en, name_he) in enumerate(BOOK_ORDER, start=1):
            candidates = list(source.rglob(f"{name_en}/Hebrew/merged.json"))
            if not candidates:
                logger.warning("Not found: %s", name_en)
                continue
            ingest_book(session, candidates[0], name_en, name_he, order, compute_milui)
        session.commit()

    logger.info("Ingestion complete.")
