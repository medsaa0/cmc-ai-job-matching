import uuid


def _register_laureat(client, **overrides):
    email = f"pytest-laureat-{uuid.uuid4().hex[:10]}@example.com"
    payload = {
        "nom": "Test", "prenom": "Laureat", "email": email, "password": "password123",
        "full_name": "Test Laureat", "niveau_formation": "Technicien Specialise",
        "filiere": "Developpement Digital", "annee_promotion": 2025,
        "competences_techniques": ["JavaScript"], "soft_skills": [],
        "localisation": "Oujda", "mobilite": "Oujda", "disponibilite": "Immediatement",
    }
    payload.update(overrides)
    res = client.post("/api/auth/register/laureat", json=payload)
    assert res.status_code == 200, res.text
    return res.json()


def _register_entreprise(client, **overrides):
    email = f"pytest-entreprise-{uuid.uuid4().hex[:10]}@example.com"
    payload = {
        "raison_sociale": "Entreprise Candidats Pytest", "secteur": "IT",
        "email": email, "password": "password123",
    }
    payload.update(overrides)
    res = client.post("/api/auth/register/entreprise", json=payload)
    assert res.status_code == 200, res.text
    return res.json()


def _admin_token(client):
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert res.status_code == 200
    return res.json()["access_token"]


def test_candidats_pour_offre_enrichi_and_stats(client):
    laureat_session = _register_laureat(client)
    laureat_token = laureat_session["access_token"]

    postuler = client.post(
        "/api/candidatures/",
        json={"id_offre": "O001"},
        headers={"Authorization": f"Bearer {laureat_token}"},
    )
    assert postuler.status_code == 200, postuler.text

    admin_token = _admin_token(client)
    res = client.get("/api/candidatures/offre/O001", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    rows = res.json()
    match = next((r for r in rows if r["id_laureat"] == laureat_session["user"]["id_laureat"]), None)
    assert match is not None
    assert "score_final" in match
    assert "competences_manquantes" in match
    assert match["nom"] == "Test"

    stats = client.get("/api/candidatures/offre/O001/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert stats.status_code == 200
    stats_body = stats.json()
    assert stats_body["nb_candidatures_total"] >= 1
    assert "en_attente" in stats_body["par_statut"]


def test_candidats_pour_offre_filtre_statut_sans_resultat(client):
    admin_token = _admin_token(client)
    res = client.get(
        "/api/candidatures/offre/O001?statut=rejetee_inexistant",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json() == []


def test_candidats_pour_offre_entreprise_non_proprietaire_refuse(client):
    entreprise_session = _register_entreprise(client)
    entreprise_token = entreprise_session["access_token"]

    res = client.get("/api/candidatures/offre/O001", headers={"Authorization": f"Bearer {entreprise_token}"})
    assert res.status_code == 403
