from sqlalchemy.orm import Session
from app.models.matching import MatchingResult
from app.models.offre import Offre
from app.models.notification import Notification


def generate_notifications(db: Session) -> int:
    results = db.query(MatchingResult).all()
    count = 0
    for r in results:
        offre = db.query(Offre).filter(Offre.id_offre == r.id_offre).first()
        if not offre:
            continue
        threshold = offre.score_min_notification or 70.0
        if r.score_final < threshold:
            continue
        existing = db.query(Notification).filter_by(
            id_laureat=r.id_laureat, id_offre=r.id_offre
        ).first()
        if existing:
            continue
        message = (
            f"Une offre compatible avec votre profil est disponible : "
            f"{offre.titre_poste} chez {offre.entreprise}. "
            f"Score de compatibilité : {r.score_final}%. Décision : {r.decision}."
        )
        notif = Notification(
            id_laureat=r.id_laureat,
            id_offre=r.id_offre,
            type_notification="Notification interne",
            message=message,
            statut="En attente",
        )
        db.add(notif)
        count += 1
    db.commit()
    return count
