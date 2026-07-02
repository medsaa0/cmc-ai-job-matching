from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
from app.services.notification_service import generate_notifications

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("/generate")
def generate(db: Session = Depends(get_db), _=Depends(require_admin)):
    count = generate_notifications(db)
    return {"message": f"{count} notifications générées."}


@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    skip: int = 0,
    limit: int = 200,
    statut: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Notification)
    if statut:
        query = query.filter(Notification.statut == statut)
    return query.order_by(Notification.date_envoi.desc()).offset(skip).limit(limit).all()


@router.get("/laureat/{id_laureat}", response_model=list[NotificationOut])
def notifs_for_laureat(
    id_laureat: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.id_laureat == id_laureat)
        .order_by(Notification.date_envoi.desc())
        .all()
    )


@router.patch("/{notif_id}/mark-as-sent", response_model=NotificationOut)
def mark_as_sent(notif_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if not n:
        raise HTTPException(404, "Notification non trouvée")
    n.statut = "Envoyée"
    db.commit()
    db.refresh(n)
    return n
