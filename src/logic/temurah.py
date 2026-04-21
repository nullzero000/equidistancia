"""
Temurah: permutación sistemática del alfabeto hebreo.

Tres sistemas clásicos:
  Atbash  (אתבש): primera ↔ última letra  א↔ת  ב↔ש  ...
  Albam   (אלבמ): primera mitad ↔ segunda mitad  א↔ל  ב↔מ  ...
  Avgad   (אבגד): cada letra → la siguiente  א→ב  ב→ג  ... ת→א

Referencia: Sefer Yetzirah 2:4; tradición talmúdica (Shabbat 104a)
"""

ALEPH_BET = "אבגדהוזחטיכלמנסעפצקרשת"  # 22 letras, orden canónico

# Tablas de sustitución — calculadas una vez al importar

def _build_atbash() -> dict[str, str]:
    return {ALEPH_BET[i]: ALEPH_BET[21 - i] for i in range(22)}

def _build_albam() -> dict[str, str]:
    return {ALEPH_BET[i]: ALEPH_BET[(i + 11) % 22] for i in range(22)}

def _build_avgad() -> dict[str, str]:
    return {ALEPH_BET[i]: ALEPH_BET[(i + 1) % 22] for i in range(22)}


ATBASH_TABLE = _build_atbash()
ALBAM_TABLE  = _build_albam()
AVGAD_TABLE  = _build_avgad()

_TABLES = {
    "atbash": ATBASH_TABLE,
    "albam":  ALBAM_TABLE,
    "avgad":  AVGAD_TABLE,
}

# Normalización de finales para aplicar tabla (finales no están en ALEPH_BET)
_FINALS_TO_STANDARD = {"ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ"}


def _normalize_for_temurah(word: str) -> str:
    return "".join(_FINALS_TO_STANDARD.get(ch, ch) for ch in word)


def transform(word: str, method: str) -> str:
    """Aplica la permutación indicada y devuelve la palabra transformada.

    Args:
        word: palabra hebrea normalizada (sin niqqud)
        method: 'atbash' | 'albam' | 'avgad'

    Returns:
        Palabra transformada. Letras fuera del alfabeto (prefijos, etc.) se preservan.
    """
    if method not in _TABLES:
        raise ValueError(f"method debe ser uno de: {list(_TABLES)}")
    table = _TABLES[method]
    normalized = _normalize_for_temurah(word)
    return "".join(table.get(ch, ch) for ch in normalized)


def gs_after_transform(word: str, method: str) -> int:
    """Gs de la forma transformada — el valor numérico que buscaremos en el corpus."""
    from src.logic.gematria import gs
    return gs(transform(word, method))


def all_transforms(word: str) -> dict[str, dict[str, int | str]]:
    """Devuelve los tres sistemas aplicados a una palabra.

    Returns:
        {
            "atbash": {"transformed": "...", "gs": N},
            "albam":  {"transformed": "...", "gs": N},
            "avgad":  {"transformed": "...", "gs": N},
        }
    """
    from src.logic.gematria import gs
    result = {}
    for method in _TABLES:
        t = transform(word, method)
        result[method] = {"transformed": t, "gs": gs(t)}
    return result
