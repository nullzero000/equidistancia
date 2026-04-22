import json
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from src.infrastructure.schema import Book, Verse, Word, get_engine, init_db
from src.logic.gematria import gs, milui, normalize, strip_niqqud
from src.logic.cleaning.policy import CleaningPolicy, GEMATRIA_POLICY
from src.logic.cleaning.tokenizer import tokenize
from src.logic.cleaning.separators import HTML_TAG, HTML_ENTITY, PARASHA_MARK

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


def _clean_for_storage(text: str) -> str:
    text = HTML_TAG.sub("", text)
    text = HTML_ENTITY.sub("", text)
    text = PARASHA_MARK.sub("", text)
    return text


def ingest_book(
    session: Session,
    path: Path,
    book_name_en: str,
    book_name_he: str,
    order: int,
    policy: CleaningPolicy = GEMATRIA_POLICY,
    compute_milui: bool = False,
) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    chapters_raw = data.get("text", [])

    book = Book(name_en=book_name_en, name_he=book_name_he, canonical_order=order)
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
                text_he=_clean_for_storage(verse_text),
            )
            session.add(verse)
            session.flush()

            for pos, token in enumerate(tokenize(verse_text, policy)):
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
    policy: CleaningPolicy = GEMATRIA_POLICY,
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
            ingest_book(session, candidates[0], name_en, name_he, order, policy, compute_milui)
        session.commit()

    logger.info("Ingestion complete.")
