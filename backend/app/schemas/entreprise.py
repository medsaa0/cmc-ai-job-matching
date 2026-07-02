from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EntrepriseRegister(BaseModel):
    raison_sociale: str
    secteur: str
    email: EmailStr
    password: str
    contact_nom: Optional[str] = None
    contact_telephone: Optional[str] = None
    ville: Optional[str] = None
    site_web: Optional[str] = None
    description: Optional[str] = None


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
