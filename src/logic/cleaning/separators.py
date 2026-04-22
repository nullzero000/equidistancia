"""Pre-compiled regex patterns for Hebrew text splitting."""
import re
from src.logic.cleaning.unicode_ranges import (
    CONSONANTS_START, CONSONANTS_END,
    MAQAF, PASEQ, SOF_PASUQ, NUN_HAFUCHA,
)

NON_HEBREW = re.compile(
    rf"[^\u{CONSONANTS_START:04X}-\u{CONSONANTS_END:04X}]"
)

WORD_SEP = re.compile(
    rf"[\s{re.escape(MAQAF)}{re.escape(PASEQ)}{re.escape(SOF_PASUQ)}{re.escape(NUN_HAFUCHA)}]+"
)

HTML_TAG     = re.compile(r"<[^>]+>")
HTML_ENTITY  = re.compile(r"&\w+;")
PARASHA_MARK = re.compile(r"\{[פסרנ]\}")

# MAM ketiv/qere spans: <span class="mam-kq"><span class="mam-kq-k">(ketiv)</span>...<span class="mam-kq-q">[qere]</span></span>
# Order of inner spans varies (k-then-q or q-then-k); ketiv wrapped in (), qere in []
MAM_KQ = re.compile(
    r'<span class="mam-kq">'
    r'(?:<span class="mam-kq-[kq]">(?:\([^)]*\)|\[[^\]]*\])</span>)'
    r'\s*'
    r'(?:<span class="mam-kq-[kq]">(?:\([^)]*\)|\[[^\]]*\])</span>)'
    r'</span>'
)
MAM_KQ_K = re.compile(r'<span class="mam-kq-k">\(([^)]*)\)</span>')
MAM_KQ_Q = re.compile(r'<span class="mam-kq-q">\[([^\]]*)\]</span>')
