from pydantic import BaseModel
from typing import Optional, List


class FiliereBase(BaseModel):
    id_filiere: str
    niveau_formation: Optional[str] = None
    niveau_acces: Optional[str] = None
    nom_filiere: Optional[str] = None
    domaine: Optional[str] = None
    description: Optional[str] = None
    competences_cibles: Optional[str] = None
    types_postes: Optional[str] = None


class FiliereCreate(FiliereBase):
    pass


class FiliereOut(FiliereBase):
    id: int

    model_config = {"from_attributes": True}
