import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.models.laureat import Laureat
from app.models.entreprise import Entreprise
from app.schemas.user import UserLogin, UserOut, Token
from app.schemas.laureat import LaureatRegister
from app.schemas.entreprise import EntrepriseRegister
from app.utils.text_cleaning import list_to_string
from app.services.matching_service import run_matching

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/register/laureat", response_model=Token)
def register_laureat(data: LaureatRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email")

    id_laureat = f"L{uuid.uuid4().hex[:10].upper()}"

    laureat = Laureat(
        id_laureat=id_laureat,
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        telephone=data.telephone,
        niveau_formation=data.niveau_formation,
        filiere=data.filiere,
        annee_promotion=data.annee_promotion,
        competences_techniques=list_to_string(data.competences_techniques),
        soft_skills=list_to_string(data.soft_skills),
        localisation=data.localisation,
        mobilite=data.mobilite,
        disponibilite=data.disponibilite,
        linkedin=data.linkedin,
        github_portfolio=data.github_portfolio,
        statut_profil="Actif",
    )
    db.add(laureat)

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role="laureat",
        id_laureat=id_laureat,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    run_matching(db, id_laureat=id_laureat)

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/register/entreprise", response_model=Token)
def register_entreprise(data: EntrepriseRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email")

    try:
        entreprise = Entreprise(
            raison_sociale=data.raison_sociale,
            secteur=data.secteur,
            description=data.description,
            ville=data.ville,
            site_web=data.site_web,
            contact_nom=data.contact_nom,
            contact_telephone=data.contact_telephone,
            statut_validation="en_attente",
        )
        db.add(entreprise)
        db.flush()

        user = User(
            full_name=data.contact_nom or data.raison_sociale,
            email=data.email,
            password_hash=hash_password(data.password),
            role="entreprise",
            entreprise_id=entreprise.id,
        )
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Un compte existe déjà avec cet email",
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Impossible de créer le compte entreprise. Vérifiez les informations saisies.",
        )

    db.refresh(user)
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}
