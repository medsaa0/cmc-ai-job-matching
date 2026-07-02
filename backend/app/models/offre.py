from sqlalchemy import Column, Integer, String, Text, Date, Float, DateTime, ForeignKey, func
from app.core.database import Base


class Offre(Base):
    __tablename__ = "offres"

    id = Column(Integer, primary_key=True, index=True)
    id_offre = Column(String(20), unique=True, index=True)
    titre_poste = Column(String(300))
    entreprise = Column(String(200))
    entreprise_id = Column(Integer, ForeignKey("entreprises.id"), nullable=True)
    niveau_formation_requis = Column(String(100), nullable=True)
    filiere_requise = Column(String(200), nullable=True)
    domaine = Column(String(200))
    localisation = Column(String(100))
    type_contrat = Column(String(100))
    niveau_experience = Column(String(100))
    competences_requises = Column(Text)
    description = Column(Text)
    source = Column(String(200))
    lien_offre = Column(String(500))
    date_publication = Column(Date)
    statut_offre = Column(String(50))
    score_min_notification = Column(Float, default=70.0)
    created_at = Column(DateTime, server_default=func.now())
