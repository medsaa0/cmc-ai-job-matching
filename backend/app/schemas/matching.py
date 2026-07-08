from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MatchingResultOut(BaseModel):
    id: int
    id_laureat: str
    id_offre: str
    score_competences: float
    score_cv_offre: float
    score_domaine: float = 0.0
    score_localisation: float
    score_experience: float
    score_disponibilite: float
    score_final: float
    decision: str
    competences_communes: Optional[str] = None
    competences_manquantes: Optional[str] = None
    date_matching: Optional[date] = None

    model_config = {"from_attributes": True}


class MatchingRunRequest(BaseModel):
    id_laureat: Optional[str] = None
    id_offre: Optional[str] = None
