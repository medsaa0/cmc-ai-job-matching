import logging
from datetime import date
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.matching import MatchingResult
from app.models.competence import Competence
from app.utils.text_cleaning import normalize, parse_list
from app.utils.domaine_matching import (
    build_filiere_domaine_map,
    get_laureat_domaine,
    get_offre_domaine,
    evaluate_domaine,
)
from app.utils.scoring import (
    score_localisation,
    score_experience,
    score_disponibilite,
    compute_score_final,
    score_to_decision,
)
from app.services.nlp_service import compute_tfidf_similarity

logger = logging.getLogger(__name__)


def _build_synonym_map(db: Session) -> dict[str, str]:
    synonyms: dict[str, str] = {}
    for c in db.query(Competence).all():
        canon = normalize(c.competence or "")
        synonyms[canon] = canon
        for syn in parse_list(c.synonymes or ""):
            synonyms[normalize(syn)] = canon
    return synonyms


def _normalize_competences(raw: str, syn_map: dict) -> list[str]:
    items = parse_list(raw)
    result = set()
    for item in items:
        n = normalize(item)
        result.add(syn_map.get(n, n))
    return list(result)


def _score_competences(laureat_comps: list[str], offre_comps: list[str]) -> tuple[float, list[str], list[str]]:
    if not offre_comps:
        return 0.0, [], []
    communes = list(set(laureat_comps) & set(offre_comps))
    manquantes = list(set(offre_comps) - set(laureat_comps))
    score = round(len(communes) / len(offre_comps) * 100, 2)
    return score, communes, manquantes


def run_matching(db: Session, id_laureat: str | None = None, id_offre: str | None = None) -> int:
    syn_map = _build_synonym_map(db)
    filiere_domaine_map = build_filiere_domaine_map(db)
    domaine_mode = settings.MATCHING_DOMAINE_MODE  # "hard" (defaut) ou "soft"

    laureats_q = db.query(Laureat)
    if id_laureat:
        laureats_q = laureats_q.filter(Laureat.id_laureat == id_laureat)
    laureats = laureats_q.all()

    offres_q = db.query(Offre).filter(Offre.statut_offre.in_(["Active", "A valider"]))
    if id_offre:
        offres_q = offres_q.filter(Offre.id_offre == id_offre)
    offres = offres_q.all()

    # Domaine de chaque offre calcule une seule fois (evite de le refaire pour chaque laureat)
    offre_domaines = {offre.id_offre: get_offre_domaine(offre) for offre in offres}

    count = 0
    for laureat in laureats:
        laureat_domaine = get_laureat_domaine(laureat, filiere_domaine_map)
        l_comps = _normalize_competences(laureat.competences_techniques or "", syn_map)
        cv_full = " ".join(filter(None, [
            laureat.cv_text, laureat.experiences, laureat.certifications, laureat.soft_skills
        ]))

        for offre in offres:
            compatible, sdom = evaluate_domaine(laureat_domaine, offre_domaines[offre.id_offre])

            existing = db.query(MatchingResult).filter_by(
                id_laureat=laureat.id_laureat, id_offre=offre.id_offre
            ).first()

            if domaine_mode == "hard" and not compatible:
                # Offre hors-domaine : aucun resultat de matching pour cette paire.
                # On supprime aussi un eventuel resultat obsolete d'un run precedent.
                if existing:
                    db.delete(existing)
                continue

            o_comps = _normalize_competences(offre.competences_requises or "", syn_map)
            sc, communes, manquantes = _score_competences(l_comps, o_comps)

            offre_text = " ".join(filter(None, [offre.description, offre.titre_poste, offre.competences_requises]))
            scv = compute_tfidf_similarity(cv_full, offre_text)
            sl = score_localisation(laureat.localisation or "", offre.localisation or "", laureat.mobilite or "")
            se = score_experience(laureat.experiences or "")
            sd = score_disponibilite(laureat.disponibilite or "")
            sf = compute_score_final(sc, scv, sdom, sl, se, sd)
            decision = score_to_decision(sf)

            if existing:
                existing.score_competences = sc
                existing.score_cv_offre = scv
                existing.score_domaine = sdom
                existing.score_localisation = sl
                existing.score_experience = se
                existing.score_disponibilite = sd
                existing.score_final = sf
                existing.decision = decision
                existing.competences_communes = "|".join(communes)
                existing.competences_manquantes = "|".join(manquantes)
                existing.date_matching = date.today()
            else:
                result = MatchingResult(
                    id_laureat=laureat.id_laureat,
                    id_offre=offre.id_offre,
                    score_competences=sc,
                    score_cv_offre=scv,
                    score_domaine=sdom,
                    score_localisation=sl,
                    score_experience=se,
                    score_disponibilite=sd,
                    score_final=sf,
                    decision=decision,
                    competences_communes="|".join(communes),
                    competences_manquantes="|".join(manquantes),
                    date_matching=date.today(),
                )
                db.add(result)
            count += 1

    db.commit()
    logger.info(f"Matching terminé: {count} paires calculées")
    return count
