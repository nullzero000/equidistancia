from sqlalchemy import Column, Integer, String, Float, ForeignKey, Index, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped


class Base(DeclarativeBase):
    __allow_unmapped__ = True


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    name_he = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=False)
    order = Column(Integer, nullable=False)

    verses = relationship("Verse", back_populates="book")


class Verse(Base):
    __tablename__ = "verses"

    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    chapter = Column(Integer, nullable=False)
    verse = Column(Integer, nullable=False)
    text_he = Column(Text, nullable=False)

    book = relationship("Book", back_populates="verses")
    words = relationship("Word", back_populates="verse")


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True)
    verse_id = Column(Integer, ForeignKey("verses.id"), nullable=False)
    position = Column(Integer, nullable=False)
    form_he = Column(String(50), nullable=False)
    normalized = Column(String(50), nullable=False)
    gs = Column(Integer, nullable=False)
    milui = Column(Integer, nullable=True)
    shoresh = Column(String(50), nullable=True)

    verse = relationship("Verse", back_populates="words")


Index("idx_words_gs", Word.gs)
Index("idx_words_normalized", Word.normalized)
Index("idx_verses_book_chapter", Verse.book_id, Verse.chapter)


def get_engine(db_url: str = "sqlite:///data/processed/tanakh.db"):
    return create_engine(db_url, echo=False)


def init_db(engine) -> None:
    Base.metadata.create_all(engine)
