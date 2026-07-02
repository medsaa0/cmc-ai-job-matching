import pandas as pd
import logging
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.filiere import Filiere
from app.models.competence import Competence
from app.models.laureat import Laureat
from app.models.offre import Offre

logger = logging.getLogger(__name__)

CSV_OPTIONS = dict(sep=";", encoding="utf-8-sig", dtype=str, keep_default_na=False)


def _read_csv(filename: str) -> pd.DataFrame:
    path = settings.DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Fichier introuvable: {path}")
    df = pd.read_csv(path, **CSV_OPTIONS)
    df.columns = [c.strip() for c in df.columns]
    df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    return df


def import_filieres(db: Session) -> dict:
    df = _read_csv("filieres.csv")
    required = ["id_filiere", "nom_filiere"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans filieres.csv: {missing}")

    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        if db.query(Filiere).filter_by(id_filiere=row["id_filiere"]).first():
            skipped += 1
            continue
        db.add(Filiere(
            id_filiere=row.get("id_filiere", ""),
            niveau_formation=row.get("niveau_formation", ""),
            niveau_acces=row.get("niveau_acces", ""),
            nom_filiere=row.get("nom_filiere", ""),
            domaine=row.get("domaine", ""),
            description=row.get("description", ""),
            competences_cibles=row.get("competences_cibles", ""),
            types_postes=row.get("types_postes", ""),
        ))
        inserted += 1
    db.commit()
    return {"inserted": inserted, "skipped": skipped}


def import_competences(db: Session) -> dict:
    df = _read_csv("competences.csv")
    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        if db.query(Competence).filter_by(id_competence=row.get("id_competence", "")).first():
            skipped += 1
            continue
        poids = 1.0
        try:
            poids = float(row.get("poids", "1.0"))
        except ValueError:
            pass
        db.add(Competence(
            id_competence=row.get("id_competence", ""),
            competence=row.get("competence", ""),
            synonymes=row.get("synonymes", ""),
            categorie=row.get("categorie", ""),
            domaine=row.get("domaine", ""),
            poids=poids,
            niveau_recommande=row.get("niveau_recommande", ""),
        ))
        inserted += 1
    db.commit()
    return {"inserted": inserted, "skipped": skipped}


def import_laureats(db: Session) -> dict:
    df = _read_csv("laureats.csv")
    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        if db.query(Laureat).filter_by(id_laureat=row.get("id_laureat", "")).first():
            skipped += 1
            continue
        annee = None
        try:
            annee = int(row.get("annee_promotion", ""))
        except (ValueError, TypeError):
            pass
        db.add(Laureat(
            id_laureat=row.get("id_laureat", ""),
            nom=row.get("nom", ""),
            prenom=row.get("prenom", ""),
            email=row.get("email", ""),
            telephone=row.get("telephone", ""),
            niveau_formation=row.get("niveau_formation", ""),
            filiere=row.get("filiere", ""),
            annee_promotion=annee,
            competences_techniques=row.get("competences_techniques", ""),
            soft_skills=row.get("soft_skills", ""),
            certifications=row.get("certifications", ""),
            experiences=row.get("experiences", ""),
            cv_text=row.get("cv_text", ""),
            localisation=row.get("localisation", ""),
            mobilite=row.get("mobilite", ""),
            disponibilite=row.get("disponibilite", ""),
            linkedin=row.get("linkedin", ""),
            github_portfolio=row.get("github_portfolio", ""),
            statut_profil=row.get("statut_profil", ""),
        ))
        inserted += 1
    db.commit()
    return {"inserted": inserted, "skipped": skipped}


def import_offres(db: Session) -> dict:
    df = _read_csv("offres.csv")
    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        if db.query(Offre).filter_by(id_offre=row.get("id_offre", "")).first():
            skipped += 1
            continue
        from datetime import date
        date_pub = None
        try:
            date_pub = date.fromisoformat(row.get("date_publication", ""))
        except (ValueError, TypeError):
            pass
        score_min = 70.0
        try:
            score_min = float(row.get("score_min_notification", "70"))
        except (ValueError, TypeError):
            pass
        db.add(Offre(
            id_offre=row.get("id_offre", ""),
            titre_poste=row.get("titre_poste", ""),
            entreprise=row.get("entreprise", ""),
            domaine=row.get("domaine", ""),
            localisation=row.get("localisation", ""),
            type_contrat=row.get("type_contrat", ""),
            niveau_experience=row.get("niveau_experience", ""),
            competences_requises=row.get("competences_requises", ""),
            description=row.get("description", ""),
            source=row.get("source", ""),
            lien_offre=row.get("lien_offre", ""),
            date_publication=date_pub,
            statut_offre=row.get("statut_offre", "Active"),
            score_min_notification=score_min,
        ))
        inserted += 1
    db.commit()
    return {"inserted": inserted, "skipped": skipped}


def import_all(db: Session) -> dict:
    return {
        "filieres": import_filieres(db),
        "competences": import_competences(db),
        "laureats": import_laureats(db),
        "offres": import_offres(db),
    }
