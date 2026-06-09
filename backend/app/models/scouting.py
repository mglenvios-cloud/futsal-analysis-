from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from datetime import datetime, timezone

from app.db.base import Base


class ScoutingData(Base):
    __tablename__ = "scouting_data"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(100), nullable=False)
    player_surname = Column(String(100), nullable=True)
    club = Column(String(100), nullable=True)
    category = Column(String(50), default="Division A")
    age = Column(Integer, nullable=True)
    position = Column(String(50), nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    minutes_played = Column(Integer, default=0)
    matches_played = Column(Integer, default=0)

    source_url = Column(String(500), nullable=True)
    source_name = Column(String(100), nullable=True)
    last_scouted = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    raw_data = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
