from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="laureat")
    id_laureat = Column(String(20), nullable=True)
    entreprise_id = Column(Integer, ForeignKey("entreprises.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
