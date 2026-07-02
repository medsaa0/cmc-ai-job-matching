from sqlalchemy import Column, Integer, String, Float, DateTime, UniqueConstraint, func
from app.core.database import Base


class Candidature(Base):
    __tablename__ = "candidatures"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), index=True, nullable=False)
    id_offre = Column(String(20), index=True, nullable=False)
    statut = Column(String(20), default="en_attente")
    match_score = Column(Float, nullable=True)
    applied_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint("id_laureat", "id_offre", name="uq_candidature_laureat_offre"),)
