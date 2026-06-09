from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    short_name = Column(String(10), nullable=True)
    logo_url = Column(String(500), nullable=True)
    category = Column(String(50), nullable=True)
    division = Column(String(50), nullable=True)
    coach = Column(String(100), nullable=True)
    stadium = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), default="Argentina")
    founded_year = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    matches_home = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    matches_away = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")
