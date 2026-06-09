from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    unique_id = Column(String(50), unique=True, index=True, nullable=False)

    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    position = Column(String(50), nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    dominant_foot = Column(String(10), nullable=True)
    jersey_number = Column(Integer, nullable=True)

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    category = Column(String(50), nullable=True)

    photo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    team = relationship("Team", back_populates="players")
    statistics = relationship("Statistics", back_populates="player", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="player", cascade="all, delete-orphan")
    cardiac_data = relationship("CardiacData", back_populates="player", cascade="all, delete-orphan")
    trainings = relationship("Training", back_populates="player", cascade="all, delete-orphan")
    injuries = relationship("Injury", back_populates="player", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="player", cascade="all, delete-orphan")
    tactical_analyses = relationship("TacticalAnalysis", back_populates="player", cascade="all, delete-orphan")
