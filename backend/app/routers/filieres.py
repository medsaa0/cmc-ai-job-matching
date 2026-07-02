from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.filiere import Filiere
from app.schemas.filiere import FiliereOut

router = APIRouter(prefix="/api/filieres", tags=["Filières"])


@router.get("/", response_model=list[FiliereOut])
def list_filieres(
    skip: int = 0,
    limit: int = 100,
    domaine: Optional[str] = None,
    niveau: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Filiere)
    if domaine:
        query = query.filter(Filiere.domaine.ilike(f"%{domaine}%"))
    if niveau:
        query = query.filter(Filiere.niveau_formation.ilike(f"%{niveau}%"))
    if q:
        query = query.filter(Filiere.nom_filiere.ilike(f"%{q}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{id_filiere}", response_model=FiliereOut)
def get_filiere(id_filiere: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    f = db.query(Filiere).filter(Filiere.id_filiere == id_filiere).first()
    if not f:
        from fastapi import HTTPException
        raise HTTPException(404, "Filière non trouvée")
    return f
