"""Filtrage par domaine/filiere pour le matching laureat <-> offre.

Un laureat ne doit recevoir que des offres de son domaine (ex: un laureat
"Developpement Digital" ne doit jamais voir une offre "Sante").
"""
import logging
from sqlalchemy.orm import Session
from app.models.filiere import Filiere
from app.utils.text_cleaning import normalize

logger = logging.getLogger(__name__)

# Synonymes de domaines : variante normalisee -> domaine canonique.
# Les domaines canoniques utilises dans Filiere.domaine / Offre.domaine sont
# la reference (ex: "Digital & IT", "Sante", ...). Cette table est extensible :
# ajouter une ligne suffit pour reconnaitre une nouvelle formulation.
DOMAINE_SYNONYMS: dict[str, str] = {
    # Digital & IT
    "digital & it": "digital & it",
    "digital it": "digital & it",
    "developpement web": "digital & it",
    "dev web": "digital & it",
    "informatique": "digital & it",
    "informatique / digital": "digital & it",
    "it": "digital & it",
    "digital": "digital & it",
    "developpement digital": "digital & it",
    # Sante
    "sante": "sante",
    "hopital": "sante",
    "medical": "sante",
    "hospitalier": "sante",
    # Autres domaines : le nom canonique se mappe sur lui-meme
    "agriculture": "agriculture",
    "agro-industrie": "agro-industrie",
    "industrie": "industrie",
    "btp": "btp",
    "batiment": "btp",
    "gestion": "gestion",
    "design & communication": "design & communication",
    "tourisme & hotellerie": "tourisme & hotellerie",
    "qhse": "qhse",
    "electricite & energie": "electricite & energie",
    "automobile": "automobile",
    "education": "education",
}


def _canonical_domaine(raw: str | None) -> str | None:
    if not raw:
        return None
    n = normalize(raw)
    if n in DOMAINE_SYNONYMS:
        return DOMAINE_SYNONYMS[n]
    # repli : recherche par inclusion (ex. "informatique / digital" contient "digital")
    for variant, canon in DOMAINE_SYNONYMS.items():
        if variant in n or n in variant:
            return canon
    return n or None


def build_filiere_domaine_map(db: Session) -> dict[str, str]:
    """normalize(nom_filiere) -> domaine canonique, calcule une seule fois par run."""
    mapping: dict[str, str] = {}
    for f in db.query(Filiere).all():
        canon = _canonical_domaine(f.domaine)
        if canon:
            mapping[normalize(f.nom_filiere or "")] = canon
    return mapping


def get_laureat_domaine(laureat, filiere_domaine_map: dict[str, str]) -> str | None:
    if not laureat.filiere:
        logger.warning("Laureat %s sans filiere renseignee : matching en repli neutre", laureat.id_laureat)
        return None
    domaine = filiere_domaine_map.get(normalize(laureat.filiere))
    if domaine is None:
        logger.warning(
            "Filiere '%s' du laureat %s introuvable dans la table filieres : matching en repli neutre",
            laureat.filiere, laureat.id_laureat,
        )
    return domaine


def get_offre_domaine(offre) -> str | None:
    return _canonical_domaine(offre.domaine) or _canonical_domaine(offre.filiere_requise)


def evaluate_domaine(laureat_domaine: str | None, offre_domaine: str | None) -> tuple[bool, float]:
    """Retourne (compatible, score_domaine).

    - Les deux domaines sont connus et identiques -> (True, 100.0)
    - Les deux domaines sont connus et differents -> (False, 0.0)
    - Un domaine est indetermine (filiere/offre non renseignee ou inconnue) ->
      (True, 50.0) : on ne bloque jamais le matching par manque de donnees,
      on applique juste un score neutre.
    """
    if laureat_domaine is None or offre_domaine is None:
        return True, 50.0
    if laureat_domaine == offre_domaine:
        return True, 100.0
    return False, 0.0


def is_domaine_compatible(laureat, offre, db: Session) -> bool:
    """Fonction de commodite (utilisee hors boucle de run_matching)."""
    filiere_map = build_filiere_domaine_map(db)
    laureat_domaine = get_laureat_domaine(laureat, filiere_map)
    offre_domaine = get_offre_domaine(offre)
    compatible, _ = evaluate_domaine(laureat_domaine, offre_domaine)
    return compatible
