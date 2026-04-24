"""Teach mode: cómo localizar el Match #1 de אינסוף en Sefaria, letra por letra.

Imprime para cada letra del match:
  - URL de Sefaria del verso
  - Offset de la letra dentro del verso (1-indexado, desde el inicio del verso)
  - Palabra y offset dentro de la palabra

Run:
    python -m scripts.locate_einsof_sefaria
"""
from src.logic.corpus.builder import build_motor, locate
from src.logic.corpus.encoding import decode, encode


def main() -> None:
    motor, offset_map = build_motor("data/processed/tanakh.db")

    # Match #1 from verify_einsof.py
    start = 249922
    skip = 65
    target = "אינסוף"
    target_bytes = encode(target)
    indices = tuple(start + i * skip for i in range(len(target_bytes)))
    expected = [decode(bytes([b])) for b in target_bytes]

    first_motor_of_verse: dict[tuple[str, int, int], int] = {}
    for mw in offset_map:
        key = (mw.book_en, mw.chapter, mw.verse)
        if key not in first_motor_of_verse:
            first_motor_of_verse[key] = mw.motor_start

    print("=" * 78)
    print(f"אינסוף — Match #1 en Sefaria — start={start}, skip={skip}")
    print("=" * 78)
    print()
    print("Cada letra vive en una posición específica del stream consonantal del")
    print("Tanaj masorético. En Sefaria, debes contar SOLO consonantes — ignora los")
    print("puntos (vowels) y las marcas (cantillation) encima/debajo de las letras.")
    print()

    for i, idx in enumerate(indices):
        mw = locate(offset_map, idx)
        verse_start = first_motor_of_verse[(mw.book_en, mw.chapter, mw.verse)]
        letter_offset_in_verse = idx - verse_start
        letter_offset_in_word = idx - mw.motor_start
        word_consonants = decode(motor[mw.motor_start : mw.motor_end])
        url_book = mw.book_en.replace(" ", "_")
        url = f"https://www.sefaria.org/{url_book}.{mw.chapter}.{mw.verse}?lang=he"

        print(f"[{i}] Letra esperada: {expected[i]}")
        print(f"    Verso    : {mw.book_en} {mw.chapter}:{mw.verse}")
        print(f"    Sefaria  : {url}")
        print(f"    Posición : consonante #{letter_offset_in_verse + 1} del verso")
        print(f"    Contexto : palabra #{mw.position + 1} del verso = '{word_consonants}'")
        print(f"               letra #{letter_offset_in_word + 1} de esa palabra")
        print()


if __name__ == "__main__":
    main()
