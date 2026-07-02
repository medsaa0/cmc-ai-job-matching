from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import require_admin, get_current_user
from app.models.matching import MatchingResult
from app.schemas.matching import MatchingResultOut, MatchingRunRequest
from app.services.matching_service import run_matching

router = APIRouter(prefix="/api/matching", tags=["Matching"])


@router.post("/run")
def run(
    req: MatchingRunRequest = MatchingRunRequest(),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    count = run_matching(db, id_laureat=req.id_laureat, id_offre=req.id_offre)
    return {"message": f"Matching terminé. {count} paires calculées."}


@router.get("/results", response_model=list[MatchingResultOut])
def list_results(
    skip: int = 0,
    limit: int = 200,
    decision: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(MatchingResult)
    if decision:
        query = query.filter(MatchingResult.decision.ilike(f"%{decision}%"))
    return query.order_by(MatchingResult.score_final.desc()).offset(skip).limit(limit).all()


@router.get("/laureat/{id_laureat}", response_model=list[MatchingResultOut])
def results_for_laureat(
    id_laureat: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(MatchingResult)
        .filter(MatchingResult.id_laureat == id_laureat)
        .order_by(MatchingResult.score_final.desc())
        .all()
    )


@router.get("/offre/{id_offre}", response_model=list[MatchingResultOut])
def results_for_offre(
    id_offre: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(MatchingResult)
        .filter(MatchingResult.id_offre == id_offre)
        .order_by(MatchingResult.score_final.desc())
        .all()
    )


@router.get("/top-offres/{id_laureat}", response_model=list[MatchingResultOut])
def top_offres(
    id_laureat: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(MatchingResult)
        .filter(MatchingResult.id_laureat == id_laureat)
        .order_by(MatchingResult.score_final.desc())
        .limit(limit)
        .all()
    )


@router.get("/top-laureats/{id_offre}", response_model=list[MatchingResultOut])
def top_laureats(
    id_offre: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(MatchingResult)
        .filter(MatchingResult.id_offre == id_offre)
        .order_by(MatchingResult.score_final.desc())
        .limit(limit)
        .all()
    )
