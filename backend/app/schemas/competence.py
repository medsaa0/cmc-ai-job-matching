from pydantic import BaseModel
from typing import Optional


class CompetenceBase(BaseModel):
    id_competence: str
    competence: Optional[str] = None
    synonymes: Optional[str] = None
    categorie: Optional[str] = None
    domaine: Optional[str] = None
    poids: Optional[float] = 1.0
    niveau_recommande: Optional[str] = None


class CompetenceCreate(CompetenceBase):
    pass


class CompetenceOut(CompetenceBase):
    id: int

    model_config = {"from_attributes": True}
