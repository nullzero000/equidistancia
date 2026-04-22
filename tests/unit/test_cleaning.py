from src.logic.cleaning.policy import ELS_POLICY, GEMATRIA_POLICY, CleaningPolicy
from src.logic.cleaning.tokenizer import tokenize

QERE_POLICY = CleaningPolicy(stream="qere")


def test_maqaf_split():
    assert tokenize("אל־תירא", GEMATRIA_POLICY) == ["אל", "תירא"]


def test_paseq_split():
    assert tokenize("אלהים ׀ לאור", GEMATRIA_POLICY) == ["אלהים", "לאור"]


def test_sof_pasuq_split():
    assert tokenize("הארץ׃ ויאמר", GEMATRIA_POLICY) == ["הארץ", "ויאמר"]


def test_idempotency_gematria():
    text = "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ"
    once  = tokenize(text, GEMATRIA_POLICY)
    twice = tokenize(" ".join(once), GEMATRIA_POLICY)
    assert once == twice


def test_idempotency_els():
    text = "וַיֹּאמֶר אֱלֹהִים יְהִי־אוֹר"
    once  = tokenize(text, ELS_POLICY)
    twice = tokenize(" ".join(once), ELS_POLICY)
    assert once == twice


def test_collapse_finals_divergence():
    assert tokenize("מלך", ELS_POLICY) == ["מלכ"]
    assert tokenize("מלך", GEMATRIA_POLICY) == ["מלך"]


def test_strip_niqud_and_teamim():
    assert tokenize("בְּרֵאשִׁ֖ית", GEMATRIA_POLICY) == ["בראשית"]


def test_empty_and_noise():
    assert tokenize("", GEMATRIA_POLICY) == []
    assert tokenize("   \t\n", GEMATRIA_POLICY) == []
    assert tokenize("123 abc", GEMATRIA_POLICY) == []


def test_html_stripped():
    assert tokenize("<b>בראשית</b>", GEMATRIA_POLICY) == ["בראשית"]


def test_parasha_mark_stripped():
    assert tokenize("ויכלו {פ} השמים", GEMATRIA_POLICY) == ["ויכלו", "השמים"]


# mam-kq ketiv/qere span resolution (k-then-q and q-then-k orderings)
_KQ_K_FIRST = 'word <span class="mam-kq"><span class="mam-kq-k">(שנה)</span> <span class="mam-kq-q">[שָׁנִים]</span></span> end'
_KQ_Q_FIRST = 'word <span class="mam-kq"><span class="mam-kq-q">[עֵינוֹ]</span> <span class="mam-kq-k">(עיניו)</span></span> end'


def test_mam_kq_ketiv_selected():
    assert tokenize(_KQ_K_FIRST, GEMATRIA_POLICY) == ["שנה"]
    assert tokenize(_KQ_Q_FIRST, GEMATRIA_POLICY) == ["עיניו"]


def test_mam_kq_qere_selected():
    assert tokenize(_KQ_K_FIRST, QERE_POLICY) == ["שנים"]
    assert tokenize(_KQ_Q_FIRST, QERE_POLICY) == ["עינו"]


def test_mam_kq_no_double_ingestion():
    # Pre-fix bug: both forms appeared as separate tokens
    assert "שנה" not in tokenize(_KQ_K_FIRST, QERE_POLICY)
    assert "שנים" not in tokenize(_KQ_K_FIRST, GEMATRIA_POLICY)
