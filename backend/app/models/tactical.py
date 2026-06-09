from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class TacticalAnalysis(Base):
    __tablename__ = "tactical_analyses"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    formation = Column(String(20), nullable=True)
    tactical_system = Column(String(100), nullable=True)

    high_press_intensity = Column(Float, default=0.0)
    mid_press_intensity = Column(Float, default=0.0)
    low_press_intensity = Column(Float, default=0.0)

    coverage_efficiency = Column(Float, default=0.0)
    rotation_quality = Column(Float, default=0.0)
    transition_offensive_speed = Column(Float, default=0.0)
    transition_defensive_speed = Column(Float, default=0.0)

    numerical_superiority_attacks = Column(Integer, default=0)
    numerical_inferiority_defenses = Column(Integer, default=0)

    heatmap_data = Column(JSON, nullable=True)
    movement_trails = Column(JSON, nullable=True)
    positioning_map = Column(JSON, nullable=True)

    analysis_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="tactical_analyses")
