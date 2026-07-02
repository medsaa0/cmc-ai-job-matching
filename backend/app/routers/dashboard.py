from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.dashboard_service import get_stats
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.entreprise import Entreprise

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_stats(db)


@router.get("/public-stats")
def public_stats(db: Session = Depends(get_db)):
    return {
        "nb_laureats": db.query(Laureat).count(),
        "nb_entreprises": db.query(Entreprise).filter(Entreprise.statut_validation == "validee").count(),
        "nb_offres_actives": db.query(Offre).filter(Offre.statut_offre == "Active").count(),
    }
