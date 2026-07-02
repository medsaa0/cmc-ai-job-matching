import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_role, require_entreprise_validee
from app.models.offre import Offre
from app.models.competence import Competence
from app.models.offre_competence import OffreCompetenceRequise
from app.models.entreprise import Entreprise
from app.schemas.offre import OffreOut, OffreGuidedCreate, OffreUpdate
from app.services.matching_service import run_matching

router = APIRouter(prefix="/api/offres", tags=["Offres"])


@router.get("/", response_model=list[OffreOut])
def list_offres(
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    domaine: Optional[str] = None,
    localisation: Optional[str] = None,
    statut: Optional[str] = None,
    type_contrat: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Offre)
    if q:
        query = query.filter(
            (Offre.titre_poste.ilike(f"%{q}%")) | (Offre.entreprise.ilike(f"%{q}%"))
        )
    if domaine:
        query = query.filter(Offre.domaine.ilike(f"%{domaine}%"))
    if localisation:
        query = query.filter(Offre.localisation.ilike(f"%{localisation}%"))
    if statut:
        query = query.filter(Offre.statut_offre.ilike(f"%{statut}%"))
    if type_contrat:
        query = query.filter(Offre.type_contrat.ilike(f"%{type_contrat}%"))
    return query.order_by(Offre.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/mine", response_model=list[OffreOut])
def my_offres(db: Session = Depends(get_db), current_user=Depends(require_role("entreprise"))):
    entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
    if not entreprise:
        raise HTTPException(404, "Profil entreprise introuvable")
    return db.query(Offre).filter(Offre.entreprise_id == entreprise.id).order_by(Offre.created_at.desc()).all()


@router.get("/{id_offre}", response_model=OffreOut)
def get_offre(id_offre: str, db: Session = Depends(get_db)):
    o = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not o:
        raise HTTPException(404, "Offre non trouvée")
    return o


def _build_competences_requises_text(db: Session, competences: list) -> str:
    if not competences:
        return ""
    ids = [c.id_competence for c in competences]
    rows = db.query(Competence).filter(Competence.id.in_(ids)).all()
    return "|".join(c.competence for c in rows if c.competence)


@router.post("/", response_model=OffreOut)
def create_offre(
    data: OffreGuidedCreate,
    db: Session = Depends(get_db),
    principal=Depends(require_entreprise_validee),
):
    current_user, entreprise = principal
    id_offre = f"O{uuid.uuid4().hex[:10].upper()}"

    offre = Offre(
        id_offre=id_offre,
        titre_poste=data.titre_poste,
        entreprise=entreprise.raison_sociale,
        entreprise_id=entreprise.id,
        domaine=data.domaine,
        localisation=data.localisation,
        type_contrat=data.type_contrat,
        niveau_experience=data.niveau_experience,
        description=data.description,
        niveau_formation_requis=data.niveau_formation_requis,
        filiere_requise=data.filiere_requise,
        competences_requises=_build_competences_requises_text(db, data.competences),
        date_publication=data.date_publication or date.today(),
        statut_offre="Active",
        source="Formulaire entreprise",
    )
    db.add(offre)
    db.flush()

    for c in data.competences:
        db.add(OffreCompetenceRequise(
            id_offre=id_offre,
            id_competence=c.id_competence,
            importance=c.importance,
            obligatoire=c.obligatoire,
        ))

    db.commit()
    db.refresh(offre)

    run_matching(db, id_offre=id_offre)

    return offre


@router.post("/admin", response_model=OffreOut)
def create_offre_admin(
    data: OffreGuidedCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    id_offre = f"O{uuid.uuid4().hex[:10].upper()}"
    offre = Offre(
        id_offre=id_offre,
        titre_poste=data.titre_poste,
        entreprise=data.entreprise_nom or "CMC de l'Oriental",
        domaine=data.domaine,
        localisation=data.localisation,
        type_contrat=data.type_contrat,
        niveau_experience=data.niveau_experience,
        description=data.description,
        niveau_formation_requis=data.niveau_formation_requis,
        filiere_requise=data.filiere_requise,
        competences_requises=_build_competences_requises_text(db, data.competences),
        date_publication=data.date_publication or date.today(),
        statut_offre="Active",
        source="CMC",
    )
    db.add(offre)
    db.flush()

    for c in data.competences:
        db.add(OffreCompetenceRequise(
            id_offre=id_offre,
            id_competence=c.id_competence,
            importance=c.importance,
            obligatoire=c.obligatoire,
        ))

    db.commit()
    db.refresh(offre)

    run_matching(db, id_offre=id_offre)

    return offre


@router.patch("/{id_offre}", response_model=OffreOut)
def update_offre(
    id_offre: str,
    data: OffreUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        raise HTTPException(404, "Offre non trouvée")

    if current_user.role != "admin":
        if current_user.role != "entreprise":
            raise HTTPException(403, "Accès non autorisé")
        entreprise = db.query(Entreprise).filter(Entreprise.id == current_user.entreprise_id).first()
        if not entreprise or offre.entreprise_id != entreprise.id:
            raise HTTPException(403, "Cette offre ne vous appartient pas")

    payload = data.model_dump(exclude_unset=True, exclude={"competences"})
    for field, value in payload.items():
        setattr(offre, field, value)

    if data.competences is not None:
        db.query(OffreCompetenceRequise).filter(OffreCompetenceRequise.id_offre == id_offre).delete()
        for c in data.competences:
            db.add(OffreCompetenceRequise(
                id_offre=id_offre,
                id_competence=c.id_competence,
                importance=c.importance,
                obligatoire=c.obligatoire,
            ))
        offre.competences_requises = _build_competences_requises_text(db, data.competences)

    db.add(offre)
    db.commit()
    db.refresh(offre)

    run_matching(db, id_offre=id_offre)

    return offre
