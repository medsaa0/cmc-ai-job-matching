import uuid


def _payload(**overrides):
    email = f"pytest-entreprise-{uuid.uuid4().hex[:10]}@example.com"
    payload = {
        "raison_sociale": "Entreprise Pytest",
        "secteur": "IT",
        "email": email,
        "password": "password123",
        "contact_nom": "Contact Pytest",
        "contact_telephone": "0600000000",
        "ville": "Oujda",
    }
    payload.update(overrides)
    return payload


def test_register_entreprise_success(client):
    res = client.post("/api/auth/register/entreprise", json=_payload())
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "entreprise"
    assert body["user"]["entreprise_id"] is not None


def test_register_entreprise_duplicate_email(client):
    payload = _payload()
    first = client.post("/api/auth/register/entreprise", json=payload)
    assert first.status_code == 200

    second = client.post("/api/auth/register/entreprise", json=payload)
    assert second.status_code == 400
    assert "existe déjà" in second.json()["detail"]


def test_register_entreprise_missing_required_field(client):
    payload = _payload()
    del payload["secteur"]
    res = client.post("/api/auth/register/entreprise", json=payload)
    assert res.status_code == 422


def test_register_entreprise_blank_raison_sociale(client):
    res = client.post("/api/auth/register/entreprise", json=_payload(raison_sociale="   "))
    assert res.status_code == 422


def test_register_entreprise_phone_too_long_returns_clean_422(client):
    res = client.post(
        "/api/auth/register/entreprise",
        json=_payload(contact_telephone="0" * 30),
    )
    assert res.status_code == 422
