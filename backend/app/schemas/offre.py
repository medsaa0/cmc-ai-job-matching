from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class OffreBase(BaseModel):
    id_offre: str
    titre_poste: Optional[str] = None
    entreprise: Optional[str] = None
    domaine: Optional[str] = None
    localisation: Optional[str] = None
    type_contrat: Optional[str] = None
    niveau_experience: Optional[str] = None
    competences_requises: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    lien_offre: Optional[str] = None
    date_publication: Optional[date] = None
    statut_offre: Optional[str] = None
    score_min_notification: Optional[float] = 70.0
    entreprise_id: Optional[int] = None
    niveau_formation_requis: Optional[str] = None
    filiere_requise: Optional[str] = None


class OffreCreate(OffreBase):
    pass


class OffreOut(OffreBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CompetenceRequiseIn(BaseModel):
    id_competence: int
    importance: int = 2
    obligatoire: bool = False


class OffreGuidedCreate(BaseModel):
    """Formulaire guidé de dépôt d'offre (questions structurées)."""

    entreprise_nom: Optional[str] = None
    titre_poste: str
    domaine: str
    localisation: str
    type_contrat: str
    niveau_experience: str
    description: str
    niveau_formation_requis: str
    filiere_requise: str
    competences: list[CompetenceRequiseIn] = []
    date_publication: Optional[date] = None


class OffreUpdate(BaseModel):
    titre_poste: Optional[str] = None
    domaine: Optional[str] = None
    localisation: Optional[str] = None
    type_contrat: Optional[str] = None
    niveau_experience: Optional[str] = None
    description: Optional[str] = None
    niveau_formation_requis: Optional[str] = None
    filiere_requise: Optional[str] = None
    statut_offre: Optional[str] = None
    competences: Optional[list[CompetenceRequiseIn]] = None
