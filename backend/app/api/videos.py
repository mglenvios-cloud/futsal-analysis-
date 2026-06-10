from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, WebSocket
from sqlalchemy.orm import Session
from typing import Optional
import aiofiles
import os
from pathlib import Path

from app.db.base import get_db
from app.core.config import settings
from app.models.video import Video
from app.models.match import Match
from app.services.video_analysis.processor import VideoProcessor

router = APIRouter()
_video_processor = None


def get_video_processor():
    global _video_processor
    if _video_processor is None:
        _video_processor = VideoProcessor(settings.MODEL_PATH)
    return _video_processor


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    match_id: Optional[int] = Form(None),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    if file.size and file.size > settings.MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_VIDEO_FORMATS:
        raise HTTPException(status_code=400, detail=f"Format {ext} not supported")

    upload_dir = Path(settings.VIDEO_UPLOAD_PATH)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename
    async with aiofiles.open(str(file_path), "wb") as f:
        content = await file.read()
        await f.write(content)

    metadata = get_video_processor().get_metadata(str(file_path))

    video = Video(
        match_id=match_id,
        title=title or file.filename,
        filename=file.filename,
        filepath=str(file_path),
        file_size=file.size or 0,
        duration=metadata.duration,
        width=metadata.width,
        height=metadata.height,
        fps=metadata.fps,
        format=ext.replace(".", ""),
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    return {
        "id": video.id,
        "filename": video.filename,
        "duration": video.duration,
        "width": video.width,
        "height": video.height,
        "fps": video.fps,
        "status": "uploaded",
    }


@router.get("/")
async def list_videos(
    match_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Video)
    if match_id:
        query = query.filter(Video.match_id == match_id)
    total = query.count()
    videos = query.order_by(Video.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "videos": [
            {
                "id": v.id,
                "title": v.title,
                "filename": v.filename,
                "duration": v.duration,
                "processing_status": v.processing_status,
                "processing_progress": v.processing_progress,
                "created_at": str(v.created_at),
            }
            for v in videos
        ],
    }


@router.get("/{video_id}")
async def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return {
        "id": video.id,
        "title": video.title,
        "filename": video.filename,
        "duration": video.duration,
        "width": video.width,
        "height": video.height,
        "fps": video.fps,
        "processing_status": video.processing_status,
        "processing_progress": video.processing_progress,
    }


@router.post("/{video_id}/process")
async def process_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video.processing_status = "processing"
    db.commit()

    try:
        result = get_video_processor().process_video(str(video.filepath))

        video.is_processed = True
        video.processing_status = "completed"
        video.processing_progress = 100.0
        db.commit()

        return {
            "status": "completed",
            "total_frames": result.total_frames_processed,
            "players_detected": len(result.player_tracks),
            "ball_trajectory_points": len(result.ball_trajectory),
        }
    except Exception as e:
        video.processing_status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws/process/{video_id}")
async def websocket_process(websocket: WebSocket, video_id: int):
    await websocket.accept()
    try:
        db = next(get_db())
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            await websocket.send_json({"error": "Video not found"})
            return

        def progress_callback(progress: float):
            import asyncio
            asyncio.run(
                websocket.send_json({"type": "progress", "progress": progress})
            )

        result = get_video_processor().process_video(str(video.filepath), progress_callback)

        video.is_processed = True
        video.processing_status = "completed"
        video.processing_progress = 100.0
        db.commit()

        await websocket.send_json(
            {
                "type": "completed",
                "total_frames": result.total_frames_processed,
                "players_detected": len(result.player_tracks),
                "ball_trajectory_points": len(result.ball_trajectory),
            }
        )
    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()
