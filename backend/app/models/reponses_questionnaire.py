from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, func
from app.core.database import Base


class ReponsesQuestionnaire(Base):
    __tablename__ = "reponses_questionnaire"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), unique=True, index=True, nullable=False)

    # Reponses brutes (toutes les questions), pour affichage/relecture
    reponses_json = Column(Text, nullable=False)

    # Champs extraits, utilises directement par le scoring (voir scoring.py / matching_service.py)
    niveau_competences_auto = Column(Integer, nullable=True)  # 1-5
    nb_projets = Column(String(50), nullable=True)
    a_fait_stage_ou_alternance = Column(Boolean, nullable=True)
    soft_skill_travail_equipe = Column(Integer, nullable=True)  # 1-5
    soft_skill_autonomie = Column(Integer, nullable=True)  # 1-5

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
