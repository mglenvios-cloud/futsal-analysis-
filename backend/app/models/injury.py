from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Injury(Base):
    __tablename__ = "injuries"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    injury_type = Column(String(100), nullable=False)
    body_part = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=True)
    date = Column(Date, nullable=False)
    recovery_date = Column(Date, nullable=True)
    days_missed = Column(Integer, nullable=True)
    matches_missed = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    is_recurring = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="injuries")
