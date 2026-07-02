from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    id_laureat = Column(String(20), index=True, nullable=False)
    type = Column(String(30), nullable=False)
    nom_fichier = Column(String(300), nullable=False)
    chemin_fichier = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())
