"""Analyse structuree du CV via l'API Gemini (gratuite).

Contrairement a l'extraction brute (documents.py::_extract_pdf_text, qui ne
fait que dumper le texte du PDF), ce module envoie ce texte a un LLM pour en
extraire des champs structures (competences, experiences, formations...).

Retro-compatible : si GEMINI_API_KEY n'est pas configuree, ou si l'appel
echoue (quota, reseau, reponse invalide), analyze_cv() renvoie None et
l'upload du CV continue de fonctionner avec seulement le texte brut, comme
avant l'ajout de cette fonctionnalite.
"""
import json
import logging
import httpx
from app.core.config import settings
from app.utils.text_cleaning import normalize, parse_list, list_to_string

logger = logging.getLogger(__name__)

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

PROMPT_TEMPLATE = """Tu es un extracteur d'informations de CV. Analyse le texte de CV ci-dessous et \
renvoie UNIQUEMENT un objet JSON valide (sans texte autour, sans markdown), avec exactement cette structure :

{{
  "nom": string ou null,
  "prenom": string ou null,
  "email": string ou null,
  "telephone": string ou null,
  "competences": [liste de strings : competences techniques / outils / technologies detectes],
  "soft_skills": [liste de strings],
  "langues": [liste de strings],
  "experiences": [{{"poste": string, "entreprise": string, "periode": string, "description": string}}],
  "formations": [{{"diplome": string, "etablissement": string, "annee": string}}]
}}

Si une information est absente du CV, utilise null (ou une liste vide pour les listes). Ne devine pas.

Texte du CV :
---
{cv_text}
---
"""


def analyze_cv(cv_text: str) -> dict | None:
    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY non configuree : analyse CV desactivee, texte brut conserve uniquement")
        return None
    if not cv_text or not cv_text.strip():
        return None

    url = GEMINI_ENDPOINT.format(model=settings.GEMINI_MODEL)
    payload = {
        "contents": [{"parts": [{"text": PROMPT_TEMPLATE.format(cv_text=cv_text[:15000])}]}],
        "generationConfig": {"response_mime_type": "application/json"},
    }
    try:
        resp = httpx.post(url, params={"key": settings.GEMINI_API_KEY}, json=payload, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw_text)
    except Exception:
        logger.exception("Echec de l'analyse CV via Gemini")
        return None


def apply_analysis_to_laureat(laureat, analysis: dict) -> None:
    """Enrichit le profil lauréat avec les champs qui alimentent le matching.

    N'écrase jamais l'identité déclarée à l'inscription (nom/prénom/email/téléphone) :
    ces champs restent visibles dans cv_analyse_json pour vérification manuelle par
    le lauréat, mais seuls compétences/expériences (utilisées par le scoring) sont
    fusionnées automatiquement dans le profil.
    """
    competences_detectees = analysis.get("competences") or []
    if competences_detectees:
        existants = set(parse_list(laureat.competences_techniques or ""))
        fusion = existants | {normalize(c) for c in competences_detectees if c}
        laureat.competences_techniques = list_to_string(sorted(fusion))

    soft_skills_detectees = analysis.get("soft_skills") or []
    if soft_skills_detectees:
        existants = set(parse_list(laureat.soft_skills or ""))
        fusion = existants | {normalize(s) for s in soft_skills_detectees if s}
        laureat.soft_skills = list_to_string(sorted(fusion))

    experiences = analysis.get("experiences") or []
    if experiences and not (laureat.experiences or "").strip():
        laureat.experiences = " ; ".join(
            f"{e.get('poste') or ''} chez {e.get('entreprise') or '?'} ({e.get('periode') or '?'})"
            for e in experiences
        )

    formations = analysis.get("formations") or []
    if formations and not (laureat.certifications or "").strip():
        laureat.certifications = " ; ".join(
            f"{f.get('diplome') or ''} - {f.get('etablissement') or '?'} ({f.get('annee') or '?'})"
            for f in formations
        )
