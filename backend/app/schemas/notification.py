from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationOut(BaseModel):
    id: int
    id_laureat: str
    id_offre: str
    type_notification: Optional[str] = None
    message: Optional[str] = None
    statut: Optional[str] = None
    date_envoi: Optional[datetime] = None

    model_config = {"from_attributes": True}
