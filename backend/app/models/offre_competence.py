from sqlalchemy import Column, Integer, Boolean, ForeignKey, String, UniqueConstraint
from app.core.database import Base


class OffreCompetenceRequise(Base):
    __tablename__ = "offre_competences_requises"

    id = Column(Integer, primary_key=True, index=True)
    id_offre = Column(String(20), index=True, nullable=False)
    id_competence = Column(Integer, ForeignKey("competences.id"), nullable=False)
    importance = Column(Integer, default=2)
    obligatoire = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("id_offre", "id_competence", name="uq_offre_competence"),)
