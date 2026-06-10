from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from app.db.base import get_db
from app.models.player import Player
from app.models.statistics import Statistics
from app.models.cardiac import CardiacData
from app.models.injury import Injury
from app.models.prediction import Prediction
from app.services.predictive_ai.predictor import PredictiveAI

router = APIRouter()
_predictive_ai = None


def get_predictive_ai():
    global _predictive_ai
    if _predictive_ai is None:
        _predictive_ai = PredictiveAI()
    return _predictive_ai


def _build_player_data(player: Player, db: Session) -> Dict:
    stats = db.query(Statistics).filter(Statistics.player_id == player.id).first()
    cardiac = db.query(CardiacData).filter(CardiacData.player_id == player.id).first()
    injuries = db.query(Injury).filter(Injury.player_id == player.id).all()

    data = {
        "age": player.age or 25,
        "height": player.height or 1.75,
        "weight": player.weight or 75,
        "goals": stats.goals if stats else 0,
        "assists": stats.assists if stats else 0,
        "matches_played": 0,
        "minutes_played": 0,
        "distance_covered": stats.distance_covered if stats else 0,
        "max_speed": stats.max_speed if stats else 0,
        "avg_speed": stats.avg_speed if stats else 0,
        "sprint_count": stats.sprint_count if stats else 0,
        "accelerations": stats.accelerations if stats else 0,
        "decelerations": stats.decelerations if stats else 0,
        "direction_changes": stats.direction_changes if stats else 0,
        "time_moving": stats.time_moving if stats else 0,
        "intensity_index": stats.intensity_index if stats else 0,
        "pass_accuracy": stats.pass_accuracy if stats else 0,
        "shots_on_target": stats.shots_on_target if stats else 0,
        "tackles": stats.tackles if stats else 0,
        "interceptions": stats.interceptions if stats else 0,
        "yellow_cards": stats.yellow_cards if stats else 0,
        "red_cards": stats.red_cards if stats else 0,
        "fouls": stats.fouls if stats else 0,
        "rating": stats.rating if stats else 50,
        "hrv": cardiac.hrv if cardiac else 60,
        "recovery_score": cardiac.recovery_score if cardiac else 70,
        "fatigue_level": cardiac.fatigue_level if cardiac else 30,
        "injury_count": len(injuries),
        "days_injured": sum(i.days_missed or 0 for i in injuries),
    }

    return data


@router.post("/{player_id}")
async def predict_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player_data = _build_player_data(player, db)
    predictions = get_predictive_ai().full_prediction(player_data)

    pred_record = Prediction(
        player_id=player_id,
        prediction_type="full",
        score=predictions.get("overall_score", 50),
        future_performance_score=predictions["performance"].score,
        injury_risk_score=predictions["injury_risk"].score,
        physical_evolution_score=predictions["potential"].physical_evolution_score,
        potential_score=predictions["potential"].score,
        predicted_metrics={
            "performance": predictions["performance"].predicted_metrics,
            "injure_risk_factors": predictions["injury_risk"].risk_factors,
        },
        recommendations={
            "performance": predictions["performance"].recommendations,
            "injury_prevention": predictions["injury_risk"].recommendations,
            "development": predictions["potential"].recommendations,
        },
        model_version=get_predictive_ai().model_version,
    )
    db.add(pred_record)
    db.commit()

    return {
        "player_id": player_id,
        "player_name": f"{player.name} {player.surname}",
        "overall_score": predictions.get("overall_score", 50),
        "performance": {
            "score": predictions["performance"].score,
            "predicted_metrics": predictions["performance"].predicted_metrics,
            "recommendations": predictions["performance"].recommendations,
        },
        "injury_risk": {
            "score": predictions["injury_risk"].score,
            "risk_factors": predictions["injury_risk"].risk_factors,
            "recommendations": predictions["injury_risk"].recommendations,
        },
        "potential": {
            "score": predictions["potential"].score,
            "physical_evolution": predictions["potential"].physical_evolution_score,
            "predicted_metrics": predictions["potential"].predicted_metrics,
            "recommendations": predictions["potential"].recommendations,
        },
    }


@router.get("/{player_id}/history")
async def get_prediction_history(player_id: int, db: Session = Depends(get_db)):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.player_id == player_id)
        .order_by(Prediction.prediction_date.desc())
        .limit(20)
        .all()
    )

    return {
        "player_id": player_id,
        "predictions": [
            {
                "id": p.id,
                "type": p.prediction_type,
                "score": p.score,
                "potential": p.potential_score,
                "injury_risk": p.injury_risk_score,
                "date": str(p.prediction_date),
            }
            for p in predictions
        ],
    }


@router.get("/ranking")
async def get_player_rankings(db: Session = Depends(get_db)):
    predictions = (
        db.query(Prediction)
        .order_by(Prediction.score.desc())
        .limit(50)
        .all()
    )

    return {
        "rankings": [
            {
                "rank": i + 1,
                "player_id": p.player_id,
                "player_name": f"{p.player.name} {p.player.surname}" if p.player else "Unknown",
                "overall_score": p.score,
                "potential_score": p.potential_score,
                "performance_score": p.future_performance_score,
                "injury_risk": p.injury_risk_score,
                "date": str(p.prediction_date),
            }
            for i, p in enumerate(predictions)
        ]
    }
