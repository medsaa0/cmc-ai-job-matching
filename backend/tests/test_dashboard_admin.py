import uuid


def _admin_token(client):
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert res.status_code == 200
    return res.json()["access_token"]


def test_dashboard_stats_contains_candidatures_par_offre(client):
    token = _admin_token(client)
    res = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    for key in [
        "nb_candidatures_total", "candidatures_par_statut", "candidatures_par_offre",
        "candidatures_par_entreprise", "offres_sans_candidature", "offres_par_statut",
        "entreprises_par_statut_validation", "taux_conversion_candidatures_par_offre",
        "taux_laureats_ayant_postule",
    ]:
        assert key in body, f"{key} manquant dans /api/dashboard/stats"

    # candidatures_par_offre doit etre triee par nb_candidatures decroissant
    counts = [row["nb_candidatures"] for row in body["candidatures_par_offre"]]
    assert counts == sorted(counts, reverse=True)


def test_dashboard_offre_detail_requires_admin(client):
    res = client.get("/api/dashboard/offre/O001/detail")
    assert res.status_code == 401

    laureat = client.post("/api/auth/register/laureat", json={
        "nom": "X", "prenom": "Y", "email": f"pytest-dashboard-laureat-{uuid.uuid4().hex[:10]}@example.com",
        "password": "password123", "full_name": "X Y", "niveau_formation": "TS",
        "filiere": "Developpement Digital", "annee_promotion": 2025,
        "competences_techniques": [], "soft_skills": [], "localisation": "Oujda",
        "mobilite": "Oujda", "disponibilite": "Immediatement",
    })
    laureat_token = laureat.json()["access_token"]
    res = client.get("/api/dashboard/offre/O001/detail", headers={"Authorization": f"Bearer {laureat_token}"})
    assert res.status_code == 403


def test_dashboard_offre_detail_not_found(client):
    token = _admin_token(client)
    res = client.get("/api/dashboard/offre/OFFRE_INEXISTANTE/detail", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 404
