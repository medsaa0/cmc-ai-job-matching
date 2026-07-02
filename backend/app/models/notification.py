from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), index=True)
    id_offre = Column(String(20), index=True)
    type_notification = Column(String(50), default="Notification interne")
    message = Column(Text)
    statut = Column(String(30), default="En attente")
    date_envoi = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
