from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.filiere import Filiere
from app.models.competence import Competence
from app.models.matching import MatchingResult
from app.models.notification import Notification
from app.utils.text_cleaning import parse_list
from collections import Counter


def get_stats(db: Session) -> dict:
    nb_laureats = db.query(func.count(Laureat.id)).scalar()
    nb_offres = db.query(func.count(Offre.id)).scalar()
    nb_filieres = db.query(func.count(Filiere.id)).scalar()
    nb_competences = db.query(func.count(Competence.id)).scalar()
    nb_matchings = db.query(func.count(MatchingResult.id)).scalar()
    score_moyen = db.query(func.avg(MatchingResult.score_final)).scalar() or 0
    notif_envoyees = db.query(func.count(Notification.id)).filter(Notification.statut == "Envoyée").scalar()
    notif_attente = db.query(func.count(Notification.id)).filter(Notification.statut == "En attente").scalar()

    comp_demandees: Counter = Counter()
    for offre in db.query(Offre).all():
        for c in parse_list(offre.competences_requises or ""):
            if c:
                comp_demandees[c] += 1

    comp_dispo: Counter = Counter()
    for l in db.query(Laureat).all():
        for c in parse_list(l.competences_techniques or ""):
            if c:
                comp_dispo[c] += 1

    offres_par_domaine: dict = {}
    for o in db.query(Offre).all():
        d = o.domaine or "Autre"
        offres_par_domaine[d] = offres_par_domaine.get(d, 0) + 1

    laureats_par_filiere: dict = {}
    for lau in db.query(Laureat).all():
        f = lau.filiere or "Autre"
        laureats_par_filiere[f] = laureats_par_filiere.get(f, 0) + 1

    decisions_count: dict = {}
    for m in db.query(MatchingResult).all():
        d = m.decision or "Inconnu"
        decisions_count[d] = decisions_count.get(d, 0) + 1

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
    }
