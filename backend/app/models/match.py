from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Date, Time
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    home_score = Column(Integer, default=0)
    away_score = Column(Integer, default=0)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    venue = Column(String(200), nullable=True)
    category = Column(String(50), nullable=True)
    round = Column(String(50), nullable=True)
    status = Column(String(20), default="scheduled")
    video_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="matches_home")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="matches_away")
    events = relationship("Event", back_populates="match", cascade="all, delete-orphan")
    videos = relationship("Video", back_populates="match", cascade="all, delete-orphan")
    statistics = relationship("Statistics", back_populates="match", cascade="all, delete-orphan")
