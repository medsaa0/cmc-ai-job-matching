from datetime import date, timedelta
from collections import Counter
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.filiere import Filiere
from app.models.competence import Competence
from app.models.matching import MatchingResult
from app.models.notification import Notification
from app.models.candidature import Candidature
from app.models.entreprise import Entreprise
from app.utils.text_cleaning import parse_list


def _group_count(db: Session, column) -> dict:
    rows = db.query(column, func.count()).group_by(column).all()
    return {(key or "Autre"): count for key, count in rows}


def get_stats(db: Session) -> dict:
    nb_laureats = db.query(func.count(Laureat.id)).scalar()
    nb_offres = db.query(func.count(Offre.id)).scalar()
    nb_filieres = db.query(func.count(Filiere.id)).scalar()
    nb_competences = db.query(func.count(Competence.id)).scalar()
    nb_matchings = db.query(func.count(MatchingResult.id)).scalar()
    score_moyen = db.query(func.avg(MatchingResult.score_final)).scalar() or 0
    notif_envoyees = db.query(func.count(Notification.id)).filter(Notification.statut == "Envoyée").scalar()
    notif_attente = db.query(func.count(Notification.id)).filter(Notification.statut == "En attente").scalar()

    # Competences : stockees en texte "|" separe -> comptage en Python necessaire
    comp_demandees: Counter = Counter()
    for offre in db.query(Offre.competences_requises).all():
        for c in parse_list(offre.competences_requises or ""):
            if c:
                comp_demandees[c] += 1

    comp_dispo: Counter = Counter()
    for l in db.query(Laureat.competences_techniques).all():
        for c in parse_list(l.competences_techniques or ""):
            if c:
                comp_dispo[c] += 1

    # Repartitions simples -> agregations SQL group by
    offres_par_domaine = _group_count(db, Offre.domaine)
    offres_par_statut = _group_count(db, Offre.statut_offre)
    laureats_par_filiere = _group_count(db, Laureat.filiere)
    decisions_count = _group_count(db, MatchingResult.decision)
    entreprises_par_statut_validation = _group_count(db, Entreprise.statut_validation)

    # Candidatures
    nb_candidatures_total = db.query(func.count(Candidature.id)).scalar()
    candidatures_par_statut = _group_count(db, Candidature.statut)

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    candidatures_aujourd_hui = (
        db.query(func.count(Candidature.id))
        .filter(func.date(Candidature.applied_at) == today)
        .scalar()
    )
    candidatures_cette_semaine = (
        db.query(func.count(Candidature.id))
        .filter(func.date(Candidature.applied_at) >= start_of_week)
        .scalar()
    )

    # Candidatures par offre (point cle demande par l'admin), triees par volume decroissant
    par_offre_rows = (
        db.query(
            Candidature.id_offre,
            Offre.titre_poste,
            Offre.entreprise,
            func.count(Candidature.id).label("nb"),
            func.avg(Candidature.match_score).label("score_moyen"),
        )
        .join(Offre, Offre.id_offre == Candidature.id_offre)
        .group_by(Candidature.id_offre, Offre.titre_poste, Offre.entreprise)
        .order_by(func.count(Candidature.id).desc())
        .all()
    )
    candidatures_par_offre = [
        {
            "id_offre": r.id_offre,
            "titre_poste": r.titre_poste,
            "entreprise": r.entreprise,
            "nb_candidatures": r.nb,
            "score_moyen": round(float(r.score_moyen), 2) if r.score_moyen is not None else None,
        }
        for r in par_offre_rows
    ]

    par_entreprise_rows = (
        db.query(Offre.entreprise, func.count(Candidature.id).label("nb"))
        .join(Candidature, Candidature.id_offre == Offre.id_offre)
        .group_by(Offre.entreprise)
        .order_by(func.count(Candidature.id).desc())
        .all()
    )
    candidatures_par_entreprise = {r.entreprise or "Autre": r.nb for r in par_entreprise_rows}

    offres_avec_candidature = db.query(Candidature.id_offre).distinct()
    offres_sans_candidature = (
        db.query(Offre.id_offre, Offre.titre_poste)
        .filter(~Offre.id_offre.in_(offres_avec_candidature))
        .all()
    )
    offres_sans_candidature_list = [{"id_offre": o.id_offre, "titre_poste": o.titre_poste} for o in offres_sans_candidature]

    nb_laureats_ayant_postule = db.query(func.count(func.distinct(Candidature.id_laureat))).scalar()

    return {
        "nb_laureats": nb_laureats,
        "nb_offres": nb_offres,
        "nb_filieres": nb_filieres,
        "nb_competences": nb_competences,
        "nb_matchings": nb_matchings,
        "score_moyen": round(float(score_moyen), 2),
        "notifications_envoyees": notif_envoyees,
        "notifications_attente": notif_attente,
        "top_competences_demandees": comp_demandees.most_common(10),
        "top_competences_disponibles": comp_dispo.most_common(10),
        "offres_par_domaine": offres_par_domaine,
        "laureats_par_filiere": laureats_par_filiere,
        "decisions_count": decisions_count,
        # Statistiques admin etendues
        "offres_par_statut": offres_par_statut,
        "entreprises_par_statut_validation": entreprises_par_statut_validation,
        "nb_candidatures_total": nb_candidatures_total,
        "candidatures_par_statut": candidatures_par_statut,
        "candidatures_aujourd_hui": candidatures_aujourd_hui,
        "candidatures_cette_semaine": candidatures_cette_semaine,
        "candidatures_par_offre": candidatures_par_offre,
        "top_offres_demandees": candidatures_par_offre[:10],
        "candidatures_par_entreprise": candidatures_par_entreprise,
        "offres_sans_candidature": offres_sans_candidature_list,
        "taux_conversion_candidatures_par_offre": (
            round(nb_candidatures_total / nb_offres, 2) if nb_offres else 0
        ),
        "taux_laureats_ayant_postule": (
            round(nb_laureats_ayant_postule / nb_laureats, 4) if nb_laureats else 0
        ),
    }


def get_offre_detail(db: Session, id_offre: str) -> dict | None:
    offre = db.query(Offre).filter(Offre.id_offre == id_offre).first()
    if not offre:
        return None

    candidatures = (
        db.query(Candidature, Laureat, MatchingResult)
        .join(Laureat, Laureat.id_laureat == Candidature.id_laureat)
        .outerjoin(
            MatchingResult,
            (MatchingResult.id_laureat == Candidature.id_laureat)
            & (MatchingResult.id_offre == Candidature.id_offre),
        )
        .filter(Candidature.id_offre == id_offre)
        .order_by(MatchingResult.score_final.desc().nullslast())
        .all()
    )

    candidatures_list = [
        {
            "candidature_id": c.id,
            "statut": c.statut,
            "applied_at": c.applied_at,
            "id_laureat": l.id_laureat,
            "nom": l.nom,
            "prenom": l.prenom,
            "score_final": m.score_final if m else None,
            "decision": m.decision if m else None,
        }
        for c, l, m in candidatures
    ]

    scores = [c["score_final"] for c in candidatures_list if c["score_final"] is not None]
    return {
        "offre": {
            "id_offre": offre.id_offre,
            "titre_poste": offre.titre_poste,
            "entreprise": offre.entreprise,
            "domaine": offre.domaine,
            "localisation": offre.localisation,
            "statut_offre": offre.statut_offre,
        },
        "nb_candidatures": len(candidatures_list),
        "score_moyen": round(sum(scores) / len(scores), 2) if scores else None,
        "candidatures": candidatures_list,
    }


def get_laureat_detail(db: Session, id_laureat: str) -> dict | None:
    laureat = db.query(Laureat).filter(Laureat.id_laureat == id_laureat).first()
    if not laureat:
        return None

    candidatures = (
        db.query(Candidature)
        .filter(Candidature.id_laureat == id_laureat)
        .order_by(Candidature.applied_at.desc())
        .all()
    )
    top_matchings = (
        db.query(MatchingResult)
        .filter(MatchingResult.id_laureat == id_laureat)
        .order_by(MatchingResult.score_final.desc())
        .limit(10)
        .all()
    )

    return {
        "laureat": {
            "id_laureat": laureat.id_laureat,
            "nom": laureat.nom,
            "prenom": laureat.prenom,
            "email": laureat.email,
            "filiere": laureat.filiere,
            "niveau_formation": laureat.niveau_formation,
            "localisation": laureat.localisation,
            "statut_profil": laureat.statut_profil,
        },
        "candidatures": [
            {
                "id_offre": c.id_offre,
                "statut": c.statut,
                "match_score": c.match_score,
                "applied_at": c.applied_at,
            }
            for c in candidatures
        ],
        "top_matchings": [
            {
                "id_offre": m.id_offre,
                "score_final": m.score_final,
                "decision": m.decision,
            }
            for m in top_matchings
        ],
    }


def get_entreprise_detail(db: Session, id_entreprise: int) -> dict | None:
    entreprise = db.query(Entreprise).filter(Entreprise.id == id_entreprise).first()
    if not entreprise:
        return None

    offres = db.query(Offre).filter(Offre.entreprise_id == id_entreprise).all()
    id_offres = [o.id_offre for o in offres]
    nb_candidatures_total = (
        db.query(func.count(Candidature.id)).filter(Candidature.id_offre.in_(id_offres)).scalar()
        if id_offres else 0
    )

    return {
        "entreprise": {
            "id": entreprise.id,
            "raison_sociale": entreprise.raison_sociale,
            "secteur": entreprise.secteur,
            "ville": entreprise.ville,
            "statut_validation": entreprise.statut_validation,
        },
        "nb_offres": len(offres),
        "nb_candidatures_total": nb_candidatures_total,
        "offres": [
            {"id_offre": o.id_offre, "titre_poste": o.titre_poste, "statut_offre": o.statut_offre}
            for o in offres
        ],
    }
