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
