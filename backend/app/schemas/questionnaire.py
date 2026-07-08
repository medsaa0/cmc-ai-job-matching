from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class QuestionOut(BaseModel):
    id: str
    dimension: str
    intitule: str
    type: str
    poids: float
    aide: Optional[str] = None
    options: Optional[Any] = None


class QuestionnaireOut(BaseModel):
    version: int
    questions: list[QuestionOut]


class ReponsesQuestionnaireIn(BaseModel):
    reponses: dict[str, Any]


class ReponsesQuestionnaireOut(BaseModel):
    id_laureat: str
    niveau_competences_auto: Optional[int] = None
    nb_projets: Optional[str] = None
    a_fait_stage_ou_alternance: Optional[bool] = None
    soft_skill_travail_equipe: Optional[int] = None
    soft_skill_autonomie: Optional[int] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
