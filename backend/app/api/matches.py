from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from app.db.base import get_db
from app.models.match import Match
from app.models.event import Event
from app.models.statistics import Statistics

router = APIRouter()


@router.get("/")
async def list_matches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    team_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Match)
    if team_id:
        query = query.filter(
            (Match.home_team_id == team_id) | (Match.away_team_id == team_id)
        )
    if status:
        query = query.filter(Match.status == status)
    total = query.count()
    matches = query.order_by(Match.date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "matches": [
            {
                "id": m.id,
                "home_team": m.home_team.name if m.home_team else "Unknown",
                "away_team": m.away_team.name if m.away_team else "Unknown",
                "home_score": m.home_score,
                "away_score": m.away_score,
                "date": str(m.date),
                "status": m.status,
                "category": m.category,
            }
            for m in matches
        ],
    }


@router.get("/{match_id}")
async def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return {
        "id": match.id,
        "home_team": match.home_team.name if match.home_team else "Unknown",
        "away_team": match.away_team.name if match.away_team else "Unknown",
        "home_score": match.home_score,
        "away_score": match.away_score,
        "date": str(match.date),
        "time": str(match.time) if match.time else None,
        "venue": match.venue,
        "category": match.category,
        "status": match.status,
        "is_processed": match.is_processed,
    }


@router.get("/{match_id}/events")
async def get_match_events(match_id: int, db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.match_id == match_id).order_by(Event.minute).all()
    return {
        "match_id": match_id,
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "minute": e.minute,
                "player": f"{e.player.name} {e.player.surname}" if e.player else None,
                "description": e.description,
            }
            for e in events
        ],
    }


@router.get("/{match_id}/statistics")
async def get_match_statistics(match_id: int, db: Session = Depends(get_db)):
    stats = db.query(Statistics).filter(Statistics.match_id == match_id).all()
    return {
        "match_id": match_id,
        "statistics": [
            {
                "player": f"{s.player.name} {s.player.surname}" if s.player else "Unknown",
                "goals": s.goals,
                "assists": s.assists,
                "distance_covered": s.distance_covered,
                "max_speed": s.max_speed,
                "rating": s.rating,
            }
            for s in stats
        ],
    }
