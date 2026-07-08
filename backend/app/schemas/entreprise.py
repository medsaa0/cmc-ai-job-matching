from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class EntrepriseRegister(BaseModel):
    raison_sociale: str = Field(..., max_length=200)
    secteur: str = Field(..., max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=6)
    contact_nom: Optional[str] = Field(None, max_length=200)
    contact_telephone: Optional[str] = Field(None, max_length=20)
    ville: Optional[str] = Field(None, max_length=100)
    site_web: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None

    @field_validator("raison_sociale", "secteur")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Ce champ ne peut pas être vide")
        return v

    @field_validator("contact_nom", "contact_telephone", "ville", "site_web", mode="before")
    @classmethod
    def blank_to_none(cls, v):
        if isinstance(v, str) and not v.strip():
            return None
        return v


class EntrepriseUpdate(BaseModel):
    raison_sociale: Optional[str] = None
    secteur: Optional[str] = None
    description: Optional[str] = None
    ville: Optional[str] = None
    site_web: Optional[str] = None
    logo_url: Optional[str] = None
    contact_nom: Optional[str] = None
    contact_telephone: Optional[str] = None


class EntrepriseOut(BaseModel):
    id: int
    raison_sociale: str
    secteur: Optional[str] = None
    description: Optional[str] = None
    ville: Optional[str] = None
    site_web: Optional[str] = None
    logo_url: Optional[str] = None
    contact_nom: Optional[str] = None
    contact_telephone: Optional[str] = None
    statut_validation: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
