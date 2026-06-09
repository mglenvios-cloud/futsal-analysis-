from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class CardiacData(Base):
    __tablename__ = "cardiac_data"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    device_type = Column(String(50), nullable=True)
    device_id = Column(String(100), nullable=True)

    heart_rate = Column(Float, nullable=True)
    heart_rate_max = Column(Float, nullable=True)
    heart_rate_avg = Column(Float, nullable=True)
    heart_rate_min = Column(Float, nullable=True)

    zone_1_duration = Column(Float, default=0.0)
    zone_2_duration = Column(Float, default=0.0)
    zone_3_duration = Column(Float, default=0.0)
    zone_4_duration = Column(Float, default=0.0)
    zone_5_duration = Column(Float, default=0.0)

    hrv = Column(Float, nullable=True)
    recovery_score = Column(Float, nullable=True)
    fatigue_level = Column(Float, nullable=True)

    timestamp = Column(DateTime, nullable=False)
    session_type = Column(String(50), nullable=True)
    extra_metrics = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="cardiac_data")
