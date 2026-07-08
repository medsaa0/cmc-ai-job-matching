import uuid
from app.core.database import SessionLocal
from app.models.matching import MatchingResult
from app.services.questionnaire_service import competences_factor, score_questionnaire


def _admin_token(client):
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    return res.json()["access_token"]


def _register_laureat(client, filiere="Developpement Digital"):
    email = f"pytest-questionnaire-{uuid.uuid4().hex[:10]}@example.com"
    res = client.post("/api/auth/register/laureat", json={
        "nom": "Q", "prenom": "Test", "email": email, "password": "password123",
        "full_name": "Q Test", "niveau_formation": "Technicien Specialise",
        "filiere": filiere, "annee_promotion": 2025,
        "competences_techniques": ["JavaScript"], "soft_skills": [],
        "localisation": "Oujda", "mobilite": "Oujda", "disponibilite": "Immediatement",
    })
    assert res.status_code == 200, res.text
    return res.json()


def test_competences_factor_and_score_questionnaire_neutral_without_reponses():
    assert competences_factor(None) == 1.0
    assert score_questionnaire(None) == 50.0


def test_get_questionnaire_returns_all_dimensions(client):
    token = _admin_token(client)
    res = client.get("/api/matching/questionnaire", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    dimensions = {q["dimension"] for q in body["questions"]}
    assert dimensions == {"competences", "experience", "domaine", "mobilite", "disponibilite", "soft_skills"}


def test_submit_reponses_updates_profile_and_rescoring(client):
    session = _register_laureat(client)
    laureat_token = session["access_token"]
    id_laureat = session["user"]["id_laureat"]

    res = client.post(
        "/api/matching/questionnaire/reponses",
        json={"reponses": {
            "competences_maitrisees": ["JavaScript", "React"],
            "niveau_competences": 5,
            "nb_projets": "3 à 5",
            "a_fait_stage_ou_alternance": True,
            "villes_acceptees": ["Oujda"],
            "disponibilite": "Immédiatement",
            "soft_skill_travail_equipe": 5,
            "soft_skill_autonomie": 5,
        }},
        headers={"Authorization": f"Bearer {laureat_token}"},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["niveau_competences_auto"] == 5
    assert body["a_fait_stage_ou_alternance"] is True

    db = SessionLocal()
    try:
        results = db.query(MatchingResult).filter_by(id_laureat=id_laureat).all()
        assert len(results) > 0
        for r in results:
            assert r.score_questionnaire == 100.0  # moyenne(5,5) -> 100
    finally:
        db.close()


def test_questionnaire_reponses_requires_laureat_role(client):
    token = _admin_token(client)
    res = client.post(
        "/api/matching/questionnaire/reponses",
        json={"reponses": {"niveau_competences": 3}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403
