from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)

    prediction_type = Column(String(50), nullable=False)
    score = Column(Float, nullable=True)

    future_performance_score = Column(Float, nullable=True)
    injury_risk_score = Column(Float, nullable=True)
    physical_evolution_score = Column(Float, nullable=True)
    potential_score = Column(Float, nullable=True)

    predicted_metrics = Column(JSON, nullable=True)
    confidence_interval = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    model_version = Column(String(20), nullable=True)
    prediction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    valid_until = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    player = relationship("Player", back_populates="predictions")
