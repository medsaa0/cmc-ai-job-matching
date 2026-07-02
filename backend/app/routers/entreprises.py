from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import require_role, require_admin
from app.models.entreprise import Entreprise
from app.schemas.entreprise import EntrepriseOut, EntrepriseUpdate

router = APIRouter(prefix="/api/entreprises", tags=["Entreprises"])


@router.get("/me", response_model=EntrepriseOut)
def my_entreprise(db: Session = Depends(get_db), current_user=Depends(require_role("entreprise"))):
    entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
    if not entreprise:
        raise HTTPException(404, "Profil entreprise introuvable")
    return entreprise


@router.patch("/me", response_model=EntrepriseOut)
def update_my_entreprise(
    data: EntrepriseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("entreprise")),
):
    entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
    if not entreprise:
        raise HTTPException(404, "Profil entreprise introuvable")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entreprise, field, value)
    db.add(entreprise)
    db.commit()
    db.refresh(entreprise)
    return entreprise


@router.get("/", response_model=list[EntrepriseOut])
def list_entreprises(
    statut: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    query = db.query(Entreprise)
    if statut:
        query = query.filter(Entreprise.statut_validation == statut)
    return query.order_by(Entreprise.created_at.desc()).all()


@router.patch("/{entreprise_id}/valider", response_model=EntrepriseOut)
def valider_entreprise(entreprise_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    entreprise = db.query(Entreprise).filter(Entreprise.id == entreprise_id).first()
    if not entreprise:
        raise HTTPException(404, "Entreprise non trouvée")
    entreprise.statut_validation = "validee"
    db.add(entreprise)
    db.commit()
    db.refresh(entreprise)
    return entreprise


@router.patch("/{entreprise_id}/rejeter", response_model=EntrepriseOut)
def rejeter_entreprise(entreprise_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    entreprise = db.query(Entreprise).filter(Entreprise.id == entreprise_id).first()
    if not entreprise:
        raise HTTPException(404, "Entreprise non trouvée")
    entreprise.statut_validation = "rejetee"
    db.add(entreprise)
    db.commit()
    db.refresh(entreprise)
    return entreprise
