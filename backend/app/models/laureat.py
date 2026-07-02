from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class Laureat(Base):
    __tablename__ = "laureats"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), unique=True, index=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    email = Column(String(255))
    telephone = Column(String(20))
    niveau_formation = Column(String(100))
    filiere = Column(String(200))
    annee_promotion = Column(Integer)
    competences_techniques = Column(Text)
    soft_skills = Column(Text)
    certifications = Column(Text)
    experiences = Column(Text)
    cv_text = Column(Text)
    cv_file_path = Column(String(500), nullable=True)
    localisation = Column(String(100))
    mobilite = Column(Text)
    disponibilite = Column(String(100))
    linkedin = Column(String(300))
    github_portfolio = Column(String(300))
    statut_profil = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
