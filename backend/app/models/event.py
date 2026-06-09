from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    event_type = Column(String(50), nullable=False)
    minute = Column(Integer, nullable=True)
    second = Column(Integer, nullable=True)
    x_position = Column(Float, nullable=True)
    y_position = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    video_timestamp = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    match = relationship("Match", back_populates="events")
    player = relationship("Player", back_populates="events")
