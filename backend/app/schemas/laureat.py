from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LaureatBase(BaseModel):
    id_laureat: str
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    niveau_formation: Optional[str] = None
    filiere: Optional[str] = None
    annee_promotion: Optional[int] = None
    competences_techniques: Optional[str] = None
    soft_skills: Optional[str] = None
    certifications: Optional[str] = None
    experiences: Optional[str] = None
    cv_text: Optional[str] = None
    localisation: Optional[str] = None
    mobilite: Optional[str] = None
    disponibilite: Optional[str] = None
    linkedin: Optional[str] = None
    github_portfolio: Optional[str] = None
    statut_profil: Optional[str] = None


class LaureatCreate(LaureatBase):
    pass


class LaureatOut(LaureatBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LaureatRegister(BaseModel):
    """Inscription self-service d'un lauréat (compte + profil + compétences initiales)."""

    full_name: str
    email: str
    password: str
    nom: str
    prenom: str
    telephone: Optional[str] = None
    niveau_formation: str
    filiere: str
    annee_promotion: int
    localisation: Optional[str] = None
    mobilite: Optional[str] = None
    disponibilite: Optional[str] = None
    linkedin: Optional[str] = None
    github_portfolio: Optional[str] = None
    competences_techniques: list[str] = []
    soft_skills: list[str] = []


class LaureatProfileUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    niveau_formation: Optional[str] = None
    filiere: Optional[str] = None
    annee_promotion: Optional[int] = None
    localisation: Optional[str] = None
    mobilite: Optional[str] = None
    disponibilite: Optional[str] = None
    linkedin: Optional[str] = None
    github_portfolio: Optional[str] = None
    experiences: Optional[str] = None
    certifications: Optional[str] = None


class LaureatCompetencesUpdate(BaseModel):
    competences_techniques: list[str] = []
    soft_skills: list[str] = []
