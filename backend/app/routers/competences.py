from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.competence import Competence
from app.schemas.competence import CompetenceOut

router = APIRouter(prefix="/api/competences", tags=["Compétences"])


@router.get("/", response_model=list[CompetenceOut])
def list_competences(
    skip: int = 0,
    limit: int = 200,
    domaine: Optional[str] = None,
    categorie: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Competence)
    if domaine:
        query = query.filter(Competence.domaine.ilike(f"%{domaine}%"))
    if categorie:
        query = query.filter(Competence.categorie.ilike(f"%{categorie}%"))
    if q:
        query = query.filter(Competence.competence.ilike(f"%{q}%"))
    return query.offset(skip).limit(limit).all()
