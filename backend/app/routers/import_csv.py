from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin
from app.services.csv_import_service import (
    import_filieres,
    import_competences,
    import_laureats,
    import_offres,
    import_all,
)

router = APIRouter(prefix="/api/import", tags=["Import CSV"])


@router.post("/filieres")
def do_import_filieres(db: Session = Depends(get_db), _=Depends(require_admin)):
    result = import_filieres(db)
    return {"status": "ok", **result}


@router.post("/competences")
def do_import_competences(db: Session = Depends(get_db), _=Depends(require_admin)):
    result = import_competences(db)
    return {"status": "ok", **result}


@router.post("/laureats")
def do_import_laureats(db: Session = Depends(get_db), _=Depends(require_admin)):
    result = import_laureats(db)
    return {"status": "ok", **result}


@router.post("/offres")
def do_import_offres(db: Session = Depends(get_db), _=Depends(require_admin)):
    result = import_offres(db)
    return {"status": "ok", **result}


@router.post("/all")
def do_import_all(db: Session = Depends(get_db), _=Depends(require_admin)):
    result = import_all(db)
    return {"status": "ok", **result}
