from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Statistics(Base):
    __tablename__ = "statistics"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    stat_type = Column(String(50), nullable=False)
    stat_category = Column(String(50), nullable=False)

    # Physical
    distance_covered = Column(Float, default=0.0)
    max_speed = Column(Float, default=0.0)
    avg_speed = Column(Float, default=0.0)
    sprint_count = Column(Integer, default=0)
    accelerations = Column(Integer, default=0)
    decelerations = Column(Integer, default=0)
    direction_changes = Column(Integer, default=0)
    time_moving = Column(Float, default=0.0)
    time_stopped = Column(Float, default=0.0)
    intensity_index = Column(Float, default=0.0)

    # Technical
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    passes = Column(Integer, default=0)
    pass_accuracy = Column(Float, default=0.0)
    shots = Column(Integer, default=0)
    shots_on_target = Column(Integer, default=0)
    tackles = Column(Integer, default=0)
    interceptions = Column(Integer, default=0)
    possessions_won = Column(Integer, default=0)
    possessions_lost = Column(Integer, default=0)
    yellow_cards = Column(Integer, default=0)
    red_cards = Column(Integer, default=0)
    fouls = Column(Integer, default=0)
    fouls_received = Column(Integer, default=0)

    # Tactical
    tactical_system = Column(String(50), nullable=True)
    pressing_intensity = Column(Float, default=0.0)
    coverage_quality = Column(Float, default=0.0)
    rotation_efficiency = Column(Float, default=0.0)
    transition_speed = Column(Float, default=0.0)

    # Additional
    minutes_played = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    extra_data = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="statistics")
    match = relationship("Match", back_populates="statistics")
