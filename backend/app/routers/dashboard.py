from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.services.dashboard_service import (
    get_stats, get_offre_detail, get_laureat_detail, get_entreprise_detail,
)
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.entreprise import Entreprise

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_stats(db)


@router.get("/offre/{id_offre}/detail")
def offre_detail(id_offre: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    detail = get_offre_detail(db, id_offre)
    if not detail:
        raise HTTPException(404, "Offre non trouvée")
    return detail


@router.get("/laureat/{id_laureat}/detail")
def laureat_detail(id_laureat: str, db: Session = Depends(get_db), _=Depends(require_admin)):
    detail = get_laureat_detail(db, id_laureat)
    if not detail:
        raise HTTPException(404, "Lauréat non trouvé")
    return detail


@router.get("/entreprise/{id_entreprise}/detail")
def entreprise_detail(id_entreprise: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    detail = get_entreprise_detail(db, id_entreprise)
    if not detail:
        raise HTTPException(404, "Entreprise non trouvée")
    return detail


@router.get("/public-stats")
def public_stats(db: Session = Depends(get_db)):
    return {
        "nb_laureats": db.query(Laureat).count(),
        "nb_entreprises": db.query(Entreprise).filter(Entreprise.statut_validation == "validee").count(),
        "nb_offres_actives": db.query(Offre).filter(Offre.statut_offre == "Active").count(),
    }
