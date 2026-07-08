import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.security import hash_password
from app.models import (
    User, Filiere, Competence, Laureat, Offre, MatchingResult, Notification,
    Entreprise, Document, Candidature, OffreCompetenceRequise, ReponsesQuestionnaire,
)
from app.routers import (
    auth, filieres, competences, laureats, offres, matching, notifications, dashboard,
    import_csv, entreprises, documents, candidatures, export,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CMC AI Job Matching API",
    description="Plateforme intelligente de matching emploi pour les lauréats du CMC",
    version="1.0.0",
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [auth.router, filieres.router, competences.router, laureats.router,
               offres.router, matching.router, notifications.router, dashboard.router,
               import_csv.router, entreprises.router, documents.router, candidatures.router,
               export.router]:
    app.include_router(router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    _seed_admin_users()
    logger.info("Application démarrée — tables créées")


def _seed_admin_users():
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@example.com").first():
            db.add(User(
                full_name="Administrateur CMC",
                email="admin@example.com",
                password_hash=hash_password("admin123"),
                role="admin",
            ))
        if not db.query(User).filter(User.email == "laureat@example.com").first():
            db.add(User(
                full_name="Lauréat Demo",
                email="laureat@example.com",
                password_hash=hash_password("laureat123"),
                role="laureat",
                id_laureat="L001",
            ))
        db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "CMC AI Job Matching API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
