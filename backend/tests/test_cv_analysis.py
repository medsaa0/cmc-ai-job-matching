from types import SimpleNamespace
from app.core.config import settings
from app.services.cv_analysis_service import analyze_cv, apply_analysis_to_laureat


def test_analyze_cv_disabled_without_api_key(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    assert analyze_cv("Texte de CV quelconque") is None


def test_analyze_cv_empty_text_returns_none():
    assert analyze_cv("") is None
    assert analyze_cv("   ") is None


def test_apply_analysis_merges_competences_without_duplicating():
    laureat = SimpleNamespace(
        competences_techniques="javascript|react",
        soft_skills="",
        experiences="",
        certifications="",
    )
    analysis = {
        "competences": ["React", "Python", "HTML"],
        "soft_skills": ["Autonomie"],
        "experiences": [{"poste": "Stagiaire Dev", "entreprise": "TechCorp", "periode": "2024"}],
        "formations": [{"diplome": "TS Dev Digital", "etablissement": "CMC Oujda", "annee": "2025"}],
    }
    apply_analysis_to_laureat(laureat, analysis)

    comps = set(laureat.competences_techniques.split("|"))
    assert comps == {"javascript", "react", "python", "html"}
    assert "autonomie" in laureat.soft_skills
    assert "TechCorp" in laureat.experiences
    assert "CMC Oujda" in laureat.certifications


def test_apply_analysis_does_not_overwrite_existing_experiences():
    laureat = SimpleNamespace(
        competences_techniques="",
        soft_skills="",
        experiences="Deja rempli manuellement",
        certifications="",
    )
    apply_analysis_to_laureat(laureat, {
        "competences": [], "soft_skills": [],
        "experiences": [{"poste": "X", "entreprise": "Y", "periode": "Z"}],
        "formations": [],
    })
    assert laureat.experiences == "Deja rempli manuellement"
