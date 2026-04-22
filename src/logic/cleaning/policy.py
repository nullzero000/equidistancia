"""Cleaning policy as immutable, serializable contract.

Refs:
- Witztum-Rips-Rosenberg 1994, Statistical Science 9(3):429-438
- McKay et al. 1999, Statistical Science 14(2):150-173
- Ginsburg 1894, The Massorah IV
"""
from typing import Literal
from pydantic import BaseModel, Field


class CleaningPolicy(BaseModel):
    strip_niqud: bool             = Field(True)
    strip_teamim: bool            = Field(True)
    strip_extended_points: bool   = Field(True)
    split_on_maqaf: bool          = Field(True)
    split_on_paseq: bool          = Field(True)
    split_on_sof_pasuq: bool      = Field(True)
    split_on_nun_hafucha: bool    = Field(True)
    collapse_finals: bool         = Field(False)
    stream: Literal["ketiv", "qere"] = Field("ketiv")

    model_config = {"frozen": True}


ELS_POLICY = CleaningPolicy(
    collapse_finals=True,   # WRR-94
    stream="ketiv",
)

GEMATRIA_POLICY = CleaningPolicy(
    collapse_finals=False,
    stream="ketiv",
)

GEMATRIA_QERE_POLICY = CleaningPolicy(
    collapse_finals=False,
    stream="qere",
)
