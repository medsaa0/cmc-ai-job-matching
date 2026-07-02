from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.laureat import Laureat
from app.schemas.laureat import LaureatOut, LaureatProfileUpdate, LaureatCompetencesUpdate
from app.utils.text_cleaning import list_to_string
from app.services.matching_service import run_matching

router = APIRouter(prefix="/api/laureats", tags=["Lauréats"])


@router.get("/me", response_model=LaureatOut)
def my_profile(db: Session = Depends(get_db), current_user=Depends(require_role("laureat"))):
    laureat = db.query(Laureat).filter(Laureat.id_laureat == current_user.id_laureat).first()
    if not laureat:
        raise HTTPException(404, "Profil lauréat introuvable")
    return laureat


@router.patch("/me", response_model=LaureatOut)
def update_my_profile(
    data: LaureatProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("laureat")),
):
    laureat = db.query(Laureat).filter(Laureat.id_laureat == current_user.id_laureat).first()
    if not laureat:
        raise HTTPException(404, "Profil lauréat introuvable")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(laureat, field, value)
    db.add(laureat)
    db.commit()
    db.refresh(laureat)
    run_matching(db, id_laureat=current_user.id_laureat)
    return laureat


@router.post("/me/competences", response_model=LaureatOut)
def update_my_competences(
    data: LaureatCompetencesUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("laureat")),
):
    laureat = db.query(Laureat).filter(Laureat.id_laureat == current_user.id_laureat).first()
    if not laureat:
        raise HTTPException(404, "Profil lauréat introuvable")
    laureat.competences_techniques = list_to_string(data.competences_techniques)
    laureat.soft_skills = list_to_string(data.soft_skills)
    db.add(laureat)
    db.commit()
    db.refresh(laureat)
    run_matching(db, id_laureat=current_user.id_laureat)
    return laureat


@router.get("/", response_model=list[LaureatOut])
def list_laureats(
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    filiere: Optional[str] = None,
    localisation: Optional[str] = None,
    statut: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Laureat)
    if q:
        query = query.filter(
            (Laureat.nom.ilike(f"%{q}%")) | (Laureat.prenom.ilike(f"%{q}%"))
        )
    if filiere:
        query = query.filter(Laureat.filiere.ilike(f"%{filiere}%"))
    if localisation:
        query = query.filter(Laureat.localisation.ilike(f"%{localisation}%"))
    if statut:
        query = query.filter(Laureat.statut_profil.ilike(f"%{statut}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{id_laureat}", response_model=LaureatOut)
def get_laureat(id_laureat: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    l = db.query(Laureat).filter(Laureat.id_laureat == id_laureat).first()
    if not l:
        raise HTTPException(404, "Lauréat non trouvé")
    return l
