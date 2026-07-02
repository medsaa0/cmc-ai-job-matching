from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class Entreprise(Base):
    __tablename__ = "entreprises"

    id = Column(Integer, primary_key=True, index=True)
    raison_sociale = Column(String(200), nullable=False)
    secteur = Column(String(200))
    description = Column(Text)
    ville = Column(String(100))
    site_web = Column(String(300))
    logo_url = Column(String(500))
    contact_nom = Column(String(200))
    contact_telephone = Column(String(20))
    statut_validation = Column(String(20), default="en_attente")
    created_at = Column(DateTime, server_default=func.now())
