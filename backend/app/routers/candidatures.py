from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role, require_admin, get_current_user
from app.models.candidature import Candidature
from app.models.offre import Offre
from app.models.matching import MatchingResult
from app.models.entreprise import Entreprise
from app.schemas.candidature import CandidatureCreate, CandidatureOut, CandidatureStatutUpdate

router = APIRouter(prefix="/api/candidatures", tags=["Candidatures"])


@router.post("/", response_model=CandidatureOut)
def postuler(
    data: CandidatureCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("laureat")),
):
    offre = db.query(Offre).filter(Offre.id_offre == data.id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")

    existing = db.query(Candidature).filter_by(
        id_laureat=current_user.id_laureat, id_offre=data.id_offre
    ).first()
    if existing:
        raise HTTPException(400, "Vous avez déjà postulé à cette offre")

    match = db.query(MatchingResult).filter_by(
        id_laureat=current_user.id_laureat, id_offre=data.id_offre
    ).first()

    candidature = Candidature(
        id_laureat=current_user.id_laureat,
        id_offre=data.id_offre,
        statut="en_attente",
        match_score=match.score_final if match else None,
    )
    db.add(candidature)
    db.commit()
    db.refresh(candidature)
    return candidature


@router.get("/me", response_model=list[CandidatureOut])
def mes_candidatures(db: Session = Depends(get_db), current_user=Depends(require_role("laureat"))):
    return (
        db.query(Candidature)
        .filter(Candidature.id_laureat == current_user.id_laureat)
        .order_by(Candidature.applied_at.desc())
        .all()
    )


def _assert_offre_owner_or_admin(offre: Offre, current_user, db: Session):
    if current_user.role == "admin":
        return
    if current_user.role != "entreprise":
        raise HTTPException(403, "Accès non autorisé")
    entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
    if not entreprise or offre.entreprise_id != entreprise.id:
        raise HTTPException(403, "Cette offre ne vous appartient pas")


@router.get("/offre/{id_offre}", response_model=list[CandidatureOut])
def candidats_pour_offre(id_offre: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")
    _assert_offre_owner_or_admin(offre, current_user, db)
    return (
        db.query(Candidature)
        .filter(Candidature.id_offre == id_offre)
        .order_by(Candidature.match_score.desc().nullslast())
        .all()
    )


@router.patch("/{candidature_id}/statut", response_model=CandidatureOut)
def maj_statut_candidature(
    candidature_id: int,
    data: CandidatureStatutUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    candidature = db.query(Candidature).filter(Candidature.id == candidature_id).first()
    if not candidature:
        raise HTTPException(404, "Candidature non trouvée")
    offre = db.query(Offre).filter(Offre.id_offre == candidature.id_offre).first()
    if offre:
        _assert_offre_owner_or_admin(offre, current_user, db)
    elif current_user.role != "admin":
        raise HTTPException(403, "Accès non autorisé")
    candidature.statut = data.statut
    db.add(candidature)
    db.commit()
    db.refresh(candidature)
    return candidature
