from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.video import Video
from app.services.physical_analysis.analyzer import PhysicalAnalyzer
from app.services.video_analysis.processor import VideoProcessor
from app.services.tactical_analysis.analyzer import TacticalAnalyzer
from app.services.predictive_ai.predictor import PredictiveAI
from app.core.config import settings

router = APIRouter()
physical_analyzer = PhysicalAnalyzer()
video_processor = VideoProcessor(settings.MODEL_PATH)
tactical_analyzer = TacticalAnalyzer()
predictive_ai = PredictiveAI()


@router.post("/physical/{video_id}")
async def analyze_physical(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video.is_processed:
        result = video_processor.process_video(str(video.filepath))
    else:
        result = video_processor.process_video(str(video.filepath))

    metrics = physical_analyzer.analyze(result.player_tracks, video.fps or 30)

    return {
        "video_id": video_id,
        "players_analyzed": len(metrics),
        "physical_metrics": {
            str(track_id): {
                "distance_covered": m.distance_covered,
                "max_speed": m.max_speed,
                "avg_speed": m.avg_speed,
                "sprint_count": m.sprint_count,
                "accelerations": m.accelerations,
                "decelerations": m.decelerations,
                "direction_changes": m.direction_changes,
                "time_moving": m.time_moving,
                "time_stopped": m.time_stopped,
                "intensity_index": m.intensity_index,
            }
            for track_id, m in metrics.items()
        },
    }


@router.post("/tactical/{video_id}")
async def analyze_tactical(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    result = video_processor.process_video(str(video.filepath))
    tactical = tactical_analyzer.analyze(result.player_tracks, result.ball_trajectory)

    return {
        "video_id": video_id,
        "tactical_analysis": {
            "formation": tactical.formation,
            "tactical_system": tactical.tactical_system,
            "high_press_intensity": tactical.high_press_intensity,
            "mid_press_intensity": tactical.mid_press_intensity,
            "low_press_intensity": tactical.low_press_intensity,
            "coverage_efficiency": tactical.coverage_efficiency,
            "rotation_quality": tactical.rotation_quality,
            "transition_offensive_speed": tactical.transition_offensive_speed,
            "transition_defensive_speed": tactical.transition_defensive_speed,
            "numerical_superiority_attacks": tactical.numerical_superiority_attacks,
            "numerical_inferiority_defenses": tactical.numerical_inferiority_defenses,
        },
        "formation_positions": tactical.formation_positions,
        "heatmap": tactical.heatmap.tolist() if hasattr(tactical.heatmap, "tolist") else tactical.heatmap,
    }


@router.post("/full/{video_id}")
async def full_analysis(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        result = video_processor.process_video(str(video.filepath))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")

    physical = physical_analyzer.analyze(result.player_tracks, video.fps or 30)
    tactical = tactical_analyzer.analyze(result.player_tracks, result.ball_trajectory)

    return {
        "video_id": video_id,
        "video_metadata": {
            "total_frames": result.total_frames_processed,
            "players_detected": len(result.player_tracks),
            "ball_trajectory_points": len(result.ball_trajectory),
        },
        "physical_metrics": {
            str(track_id): {
                "distance_covered": m.distance_covered,
                "max_speed": m.max_speed,
                "avg_speed": m.avg_speed,
                "sprint_count": m.sprint_count,
                "accelerations": m.accelerations,
                "intensity_index": m.intensity_index,
            }
            for track_id, m in physical.items()
        },
        "tactical_analysis": {
            "formation": tactical.formation,
            "tactical_system": tactical.tactical_system,
            "high_press_intensity": tactical.high_press_intensity,
            "coverage_efficiency": tactical.coverage_efficiency,
            "rotation_quality": tactical.rotation_quality,
            "transition_offensive_speed": tactical.transition_offensive_speed,
            "transition_defensive_speed": tactical.transition_defensive_speed,
        },
    }
