from pydantic import BaseModel
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    id_laureat: str
    type: str
    nom_fichier: str
    uploaded_at: datetime | None = None

    model_config = {"from_attributes": True}
