def score_to_decision(score: float) -> str:
    if score >= 80:
        return "Très recommandé"
    if score >= 65:
        return "Recommandé"
    if score >= 50:
        return "Moyen"
    return "Non prioritaire"


def score_localisation(laureat_localisation: str, offre_localisation: str, mobilite: str) -> float:
    from app.utils.text_cleaning import normalize, parse_list
    loc_l = normalize(laureat_localisation)
    loc_o = normalize(offre_localisation)
    if loc_l == loc_o:
        return 100.0
    mobilite_list = parse_list(mobilite)
    if normalize(offre_localisation) in mobilite_list:
        return 80.0
    return 60.0


def score_experience(experiences: str) -> float:
    if not experiences or experiences.strip() == "":
        return 50.0
    exp_lower = experiences.lower()
    if "projet pratique" in exp_lower and "stage" not in exp_lower:
        return 70.0
    return 90.0


def score_disponibilite(disponibilite: str) -> float:
    d = (disponibilite or "").lower()
    if "immediatement" in d or "immédiatement" in d:
        return 100.0
    if "1 mois" in d:
        return 80.0
    if "stage" in d:
        return 70.0
    return 60.0


def compute_score_final(
    sc: float, scv: float, sl: float, se: float, sd: float
) -> float:
    return round(0.40 * sc + 0.25 * scv + 0.15 * sl + 0.10 * se + 0.10 * sd, 2)
