from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    duration = Column(Float, nullable=True)
    intensity = Column(String(20), nullable=True)
    distance_covered = Column(Float, default=0.0)
    avg_heart_rate = Column(Float, nullable=True)
    max_heart_rate = Column(Float, nullable=True)
    calories_burned = Column(Float, nullable=True)
    type = Column(String(50), nullable=True)
    notes = Column(String(500), nullable=True)
    metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="trainings")
