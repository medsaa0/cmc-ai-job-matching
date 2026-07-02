import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin, get_current_user
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.entreprise import Entreprise
from app.models.matching import MatchingResult

router = APIRouter(prefix="/api/export", tags=["Export CSV"])


def _csv_response(rows: list[dict], fieldnames: list[str], filename: str) -> StreamingResponse:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, delimiter=";")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/laureats.csv")
def export_laureats(db: Session = Depends(get_db), _=Depends(require_admin)):
    laureats = db.query(Laureat).all()
    fieldnames = [
        "id_laureat", "nom", "prenom", "email", "filiere", "niveau_formation",
        "annee_promotion", "localisation", "disponibilite", "competences_techniques",
    ]
    rows = [{f: getattr(l, f) for f in fieldnames} for l in laureats]
    return _csv_response(rows, fieldnames, "laureats.csv")


@router.get("/offres.csv")
def export_offres(db: Session = Depends(get_db), _=Depends(require_admin)):
    offres = db.query(Offre).all()
    fieldnames = [
        "id_offre", "titre_poste", "entreprise", "domaine", "localisation",
        "type_contrat", "niveau_experience", "statut_offre", "competences_requises",
    ]
    rows = [{f: getattr(o, f) for f in fieldnames} for o in offres]
    return _csv_response(rows, fieldnames, "offres.csv")


@router.get("/matching/offre/{id_offre}.csv")
def export_matching_offre(id_offre: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")
    if current_user.role != "admin":
        if current_user.role != "entreprise":
            raise HTTPException(403, "Accès non autorisé")
        entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
        if not entreprise or offre.entreprise_id != entreprise.id:
            raise HTTPException(403, "Cette offre ne vous appartient pas")

    results = (
        db.query(MatchingResult)
        .filter(MatchingResult.id_offre == id_offre)
        .order_by(MatchingResult.score_final.desc())
        .all()
    )
    laureats_by_id = {l.id_laureat: l for l in db.query(Laureat).all()}
    fieldnames = [
        "id_laureat", "nom", "prenom", "email", "filiere", "score_competences",
        "score_cv_offre", "score_localisation", "score_experience",
        "score_disponibilite", "score_final", "decision",
    ]
    rows = []
    for r in results:
        l = laureats_by_id.get(r.id_laureat)
        rows.append({
            "id_laureat": r.id_laureat,
            "nom": l.nom if l else "",
            "prenom": l.prenom if l else "",
            "email": l.email if l else "",
            "filiere": l.filiere if l else "",
            "score_competences": r.score_competences,
            "score_cv_offre": r.score_cv_offre,
            "score_localisation": r.score_localisation,
            "score_experience": r.score_experience,
            "score_disponibilite": r.score_disponibilite,
            "score_final": r.score_final,
            "decision": r.decision,
        })
    return _csv_response(rows, fieldnames, f"matching_{id_offre}.csv")
