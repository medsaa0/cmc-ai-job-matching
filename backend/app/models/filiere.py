from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class Filiere(Base):
    __tablename__ = "filieres"

    id = Column(Integer, primary_key=True, index=True)
    id_filiere = Column(String(20), unique=True, index=True)
    niveau_formation = Column(String(100))
    niveau_acces = Column(String(100))
    nom_filiere = Column(String(200))
    domaine = Column(String(200))
    description = Column(Text)
    competences_cibles = Column(Text)
    types_postes = Column(Text)
