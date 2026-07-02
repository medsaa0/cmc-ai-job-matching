from sqlalchemy import Column, Integer, String, Text, Float
from app.core.database import Base


class Competence(Base):
    __tablename__ = "competences"

    id = Column(Integer, primary_key=True, index=True)
    id_competence = Column(String(20), unique=True, index=True)
    competence = Column(String(200))
    synonymes = Column(Text)
    categorie = Column(String(100))
    domaine = Column(String(200))
    poids = Column(Float, default=1.0)
    niveau_recommande = Column(String(100))
