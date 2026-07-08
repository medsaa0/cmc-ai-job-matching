from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, func
from app.core.database import Base


class MatchingResult(Base):
    __tablename__ = "matching_results"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), index=True)
    id_offre = Column(String(20), index=True)
    score_competences = Column(Float, default=0.0)
    score_cv_offre = Column(Float, default=0.0)
    score_domaine = Column(Float, default=0.0)
    score_localisation = Column(Float, default=0.0)
    score_experience = Column(Float, default=0.0)
    score_disponibilite = Column(Float, default=0.0)
    score_final = Column(Float, default=0.0)
    decision = Column(String(50))
    competences_communes = Column(Text)
    competences_manquantes = Column(Text)
    date_matching = Column(Date, server_default=func.current_date())
    created_at = Column(DateTime, server_default=func.now())
