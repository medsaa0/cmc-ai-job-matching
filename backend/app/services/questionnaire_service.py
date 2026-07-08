"""Questionnaire de matching guide : questions -> profil laureat -> signaux de score.

La structure des questions vit dans app/data/questionnaire_matching.json.
Chaque question declare sa `dimension` (competences / experience / domaine /
mobilite / disponibilite / soft_skills) : c'est le lien explicite entre la
question posee et la partie du score qu'elle influence (voir compute_score_final
dans scoring.py et son usage dans matching_service.run_matching).
"""
import json
import logging
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.laureat import Laureat
from app.models.competence import Competence
from app.models.filiere import Filiere
from app.models.reponses_questionnaire import ReponsesQuestionnaire
from app.utils.text_cleaning import list_to_string

logger = logging.getLogger(__name__)

QUESTIONNAIRE_PATH = Path(__file__).parent.parent / "data" / "questionnaire_matching.json"


def load_questionnaire_definition() -> dict:
    with open(QUESTIONNAIRE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_questionnaire(db: Session) -> dict:
    """Renvoie la structure du questionnaire avec les options dynamiques resolues."""
    definition = load_questionnaire_definition()
    villes = sorted({v for (v,) in db.query(Laureat.localisation).distinct() if v})
    domaines = sorted({d for (d,) in db.query(Filiere.domaine).distinct() if d})
    competences = [
        {"id_competence": c.id_competence, "competence": c.competence}
        for c in db.query(Competence).order_by(Competence.competence).all()
    ]

    questions = []
    for q in definition["questions"]:
        q = dict(q)
        source = q.pop("options_source", None)
        if source == "villes":
            q["options"] = villes
        elif source == "domaines":
            q["options"] = domaines
        elif source == "competences":
            q["options"] = competences
        questions.append(q)

    return {"version": definition["version"], "questions": questions}


def _get_answer(reponses: dict, question_id: str):
    return reponses.get(question_id)


def save_reponses(db: Session, id_laureat: str, reponses: dict) -> ReponsesQuestionnaire:
    """Enregistre les reponses brutes + met a jour le profil Laureat correspondant."""
    laureat = db.query(Laureat).filter(Laureat.id_laureat == id_laureat).first()
    if not laureat:
        raise ValueError(f"Laureat {id_laureat} introuvable")

    niveau_competences = _get_answer(reponses, "niveau_competences")
    nb_projets = _get_answer(reponses, "nb_projets")
    a_fait_stage = _get_answer(reponses, "a_fait_stage_ou_alternance")
    soft_equipe = _get_answer(reponses, "soft_skill_travail_equipe")
    soft_autonomie = _get_answer(reponses, "soft_skill_autonomie")

    existing = db.query(ReponsesQuestionnaire).filter_by(id_laureat=id_laureat).first()
    if not existing:
        existing = ReponsesQuestionnaire(id_laureat=id_laureat)
        db.add(existing)

    existing.reponses_json = json.dumps(reponses, ensure_ascii=False)
    existing.niveau_competences_auto = niveau_competences
    existing.nb_projets = nb_projets
    existing.a_fait_stage_ou_alternance = a_fait_stage
    existing.soft_skill_travail_equipe = soft_equipe
    existing.soft_skill_autonomie = soft_autonomie

    # Dimension competences : la liste confirmee par le laureat remplace/complete son profil
    competences_maitrisees = _get_answer(reponses, "competences_maitrisees")
    if competences_maitrisees:
        laureat.competences_techniques = list_to_string(competences_maitrisees)

    # Dimension experience : resume textuel ajoute au profil, lu par score_experience()
    # (qui detecte les mots-cles "stage" / "projet pratique" dans Laureat.experiences)
    if a_fait_stage:
        laureat.experiences = "Stage, alternance ou emploi realise dans le domaine"
    elif nb_projets and nb_projets != "Aucun":
        laureat.experiences = f"{nb_projets} projet pratique(s) realise(s), sans stage"

    # Dimension mobilite : villes acceptees + mobilite nationale -> Laureat.mobilite
    villes_acceptees = _get_answer(reponses, "villes_acceptees") or []
    mobilite_nationale = _get_answer(reponses, "mobilite_nationale")
    if mobilite_nationale:
        laureat.mobilite = "national"
    elif villes_acceptees:
        laureat.mobilite = list_to_string(villes_acceptees)

    # Dimension disponibilite : reponse directement compatible avec score_disponibilite()
    disponibilite = _get_answer(reponses, "disponibilite")
    if disponibilite:
        laureat.disponibilite = disponibilite

    db.add(laureat)
    db.commit()
    db.refresh(existing)
    return existing


def competences_factor(reponses: ReponsesQuestionnaire | None) -> float:
    """Facteur multiplicatif applique a score_competences (voir matching_service).

    Sans questionnaire rempli -> facteur neutre 1.0 (retro-compatibilite).
    Niveau 1/5 -> 0.85 (penalise un score sur-estime par le simple recouvrement
    de mots-cles) ; niveau 5/5 -> 1.15 (valorise une maitrise confirmee).
    """
    if not reponses or not reponses.niveau_competences_auto:
        return 1.0
    niveau = max(1, min(5, reponses.niveau_competences_auto))
    return round(0.85 + 0.075 * (niveau - 1), 3)


def score_questionnaire(reponses: ReponsesQuestionnaire | None) -> float:
    """Score 0-100 base sur les mises en situation soft skills du questionnaire.

    Sans questionnaire rempli -> 50.0 (neutre, n'avantage ni ne penalise).
    """
    if not reponses:
        return 50.0
    valeurs = [v for v in (reponses.soft_skill_travail_equipe, reponses.soft_skill_autonomie) if v]
    if not valeurs:
        return 50.0
    moyenne = sum(valeurs) / len(valeurs)
    return round((moyenne - 1) / 4 * 100, 2)
