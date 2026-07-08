from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://cmc_user:cmc_password@db:5432/cmc_matching"
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:3000"
    # "hard" = les offres hors-domaine sont exclues du matching (aucun MatchingResult cree)
    # "soft" = toutes les paires sont scorees, le score_domaine penalise juste les offres hors-domaine
    MATCHING_DOMAINE_MODE: str = "hard"
    DATA_DIR: Path = Path(__file__).parent.parent / "data" / "raw"
    UPLOAD_DIR: Path = Path(__file__).parent.parent.parent / "storage" / "uploads"

    class Config:
        env_file = ".env"


settings = Settings()
