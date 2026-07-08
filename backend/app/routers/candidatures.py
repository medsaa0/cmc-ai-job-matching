from collections import Counter
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role, require_admin, get_current_user
from app.models.candidature import Candidature
from app.models.offre import Offre
from app.models.laureat import Laureat
from app.models.matching import MatchingResult
from app.models.entreprise import Entreprise
from app.schemas.candidature import (
    CandidatureCreate, CandidatureOut, CandidatureStatutUpdate,
    CandidatureEnrichie, CandidatureOffreStats,
)

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


def _fetch_candidatures_enrichies(
    db: Session,
    id_offre: str,
    statut: Optional[str] = None,
    score_min: Optional[float] = None,
    decision: Optional[str] = None,
) -> list[CandidatureEnrichie]:
    query = (
        db.query(Candidature, Laureat, MatchingResult)
        .join(Laureat, Laureat.id_laureat == Candidature.id_laureat)
        .outerjoin(
            MatchingResult,
            (MatchingResult.id_laureat == Candidature.id_laureat)
            & (MatchingResult.id_offre == Candidature.id_offre),
        )
        .filter(Candidature.id_offre == id_offre)
    )
    if statut:
        query = query.filter(Candidature.statut == statut)
    if decision:
        query = query.filter(MatchingResult.decision == decision)
    if score_min is not None:
        query = query.filter(MatchingResult.score_final >= score_min)

    rows = query.order_by(MatchingResult.score_final.desc().nullslast()).all()

    result = []
    for candidature, laureat, match in rows:
        result.append(CandidatureEnrichie(
            candidature_id=candidature.id,
            statut=candidature.statut,
            applied_at=candidature.applied_at,
            id_laureat=laureat.id_laureat,
            nom=laureat.nom,
            prenom=laureat.prenom,
            email=laureat.email,
            telephone=laureat.telephone,
            filiere=laureat.filiere,
            niveau_formation=laureat.niveau_formation,
            localisation=laureat.localisation,
            linkedin=laureat.linkedin,
            github_portfolio=laureat.github_portfolio,
            score_final=match.score_final if match else None,
            score_competences=match.score_competences if match else None,
            score_cv_offre=match.score_cv_offre if match else None,
            score_localisation=match.score_localisation if match else None,
            score_domaine=match.score_domaine if match else None,
            decision=match.decision if match else None,
            competences_communes=[c for c in (match.competences_communes or "").split("|") if c] if match else [],
            competences_manquantes=[c for c in (match.competences_manquantes or "").split("|") if c] if match else [],
        ))
    return result


@router.get("/offre/{id_offre}", response_model=list[CandidatureEnrichie])
def candidats_pour_offre(
    id_offre: str,
    statut: Optional[str] = Query(None),
    score_min: Optional[float] = Query(None),
    decision: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")
    _assert_offre_owner_or_admin(offre, current_user, db)
    return _fetch_candidatures_enrichies(db, id_offre, statut=statut, score_min=score_min, decision=decision)


@router.get("/offre/{id_offre}/stats", response_model=CandidatureOffreStats)
def stats_candidatures_offre(
    id_offre: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")
    _assert_offre_owner_or_admin(offre, current_user, db)

    candidatures = _fetch_candidatures_enrichies(db, id_offre)

    par_statut: Counter = Counter(c.statut for c in candidatures)
    par_decision: Counter = Counter(c.decision for c in candidatures if c.decision)
    scores = [c.score_final for c in candidatures if c.score_final is not None]
    score_moyen = round(sum(scores) / len(scores), 2) if scores else None

    competences_manquantes_count: Counter = Counter()
    for c in candidatures:
        competences_manquantes_count.update(c.competences_manquantes)

    return CandidatureOffreStats(
        nb_candidatures_total=len(candidatures),
        par_statut=dict(par_statut),
        par_decision=dict(par_decision),
        score_moyen=score_moyen,
        top_competences_manquantes=competences_manquantes_count.most_common(10),
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
