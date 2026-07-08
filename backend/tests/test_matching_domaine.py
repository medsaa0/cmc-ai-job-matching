import pytest
from app.core.database import SessionLocal
from app.models.laureat import Laureat
from app.models.offre import Offre
from app.models.filiere import Filiere
from app.models.matching import MatchingResult
from app.services.matching_service import run_matching
from app.utils.domaine_matching import evaluate_domaine, is_domaine_compatible


def test_evaluate_domaine_same_domain_is_compatible():
    compatible, score = evaluate_domaine("digital & it", "digital & it")
    assert compatible is True
    assert score == 100.0


def test_evaluate_domaine_different_domain_is_incompatible():
    compatible, score = evaluate_domaine("digital & it", "sante")
    assert compatible is False
    assert score == 0.0


def test_evaluate_domaine_unknown_falls_back_neutral():
    compatible, score = evaluate_domaine(None, "sante")
    assert compatible is True
    assert score == 50.0

    compatible, score = evaluate_domaine("digital & it", None)
    assert compatible is True
    assert score == 50.0


@pytest.fixture()
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_run_matching_never_crosses_domains(db):
    laureat = (
        db.query(Laureat)
        .join(Filiere, Filiere.nom_filiere.ilike(Laureat.filiere))
        .filter(Filiere.domaine == "Digital & IT")
        .first()
    )
    assert laureat is not None, "seed data doit contenir au moins un laureat Digital & IT"

    run_matching(db, id_laureat=laureat.id_laureat)

    results = (
        db.query(MatchingResult, Offre)
        .join(Offre, Offre.id_offre == MatchingResult.id_offre)
        .filter(MatchingResult.id_laureat == laureat.id_laureat)
        .all()
    )
    assert len(results) > 0
    for _, offre in results:
        assert offre.domaine == "Digital & IT", (
            f"un laureat Digital & IT ne doit jamais matcher une offre '{offre.domaine}'"
        )


def test_is_domaine_compatible_cross_domain_false(db):
    laureat = (
        db.query(Laureat)
        .join(Filiere, Filiere.nom_filiere.ilike(Laureat.filiere))
        .filter(Filiere.domaine == "Digital & IT")
        .first()
    )
    offre_sante = db.query(Offre).filter(Offre.domaine == "Sante").first()
    assert laureat is not None and offre_sante is not None

    assert is_domaine_compatible(laureat, offre_sante, db) is False
