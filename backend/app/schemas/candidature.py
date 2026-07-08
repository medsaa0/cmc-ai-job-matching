from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CandidatureCreate(BaseModel):
    id_offre: str


class CandidatureStatutUpdate(BaseModel):
    statut: str


class CandidatureOut(BaseModel):
    id: int
    id_laureat: str
    id_offre: str
    statut: str
    match_score: Optional[float] = None
    applied_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CandidatureEnrichie(BaseModel):
    candidature_id: int
    statut: str
    applied_at: Optional[datetime] = None

    id_laureat: str
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    filiere: Optional[str] = None
    niveau_formation: Optional[str] = None
    localisation: Optional[str] = None
    linkedin: Optional[str] = None
    github_portfolio: Optional[str] = None

    score_final: Optional[float] = None
    score_competences: Optional[float] = None
    score_cv_offre: Optional[float] = None
    score_localisation: Optional[float] = None
    score_domaine: Optional[float] = None
    decision: Optional[str] = None
    competences_communes: list[str] = []
    competences_manquantes: list[str] = []

    model_config = {"from_attributes": True}


class CandidatureOffreStats(BaseModel):
    nb_candidatures_total: int
    par_statut: dict[str, int]
    par_decision: dict[str, int]
    score_moyen: Optional[float] = None
    top_competences_manquantes: list[tuple[str, int]] = []
