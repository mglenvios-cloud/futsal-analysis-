from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.base import get_db
from app.models.player import Player
from app.schemas.player import (
    PlayerCreate,
    PlayerUpdate,
    PlayerResponse,
    PlayerListResponse,
)

router = APIRouter()


@router.get("/", response_model=PlayerListResponse)
async def list_players(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    team_id: Optional[int] = None,
    position: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Player)

    if team_id:
        query = query.filter(Player.team_id == team_id)
    if position:
        query = query.filter(Player.position == position)
    if search:
        query = query.filter(
            Player.name.ilike(f"%{search}%") | Player.surname.ilike(f"%{search}%")
        )

    total = query.count()
    players = query.offset((page - 1) * page_size).limit(page_size).all()

    return PlayerListResponse(
        total=total,
        page=page,
        page_size=page_size,
        players=[PlayerResponse.model_validate(p) for p in players],
    )


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return PlayerResponse.model_validate(player)


@router.post("/", response_model=PlayerResponse, status_code=201)
async def create_player(player_data: PlayerCreate, db: Session = Depends(get_db)):
    import uuid
    player = Player(
        **player_data.model_dump(),
        unique_id=f"PLAYER_{uuid.uuid4().hex[:8].upper()}",
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return PlayerResponse.model_validate(player)


@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: int,
    player_data: PlayerUpdate,
    db: Session = Depends(get_db),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    for key, value in player_data.model_dump(exclude_unset=True).items():
        setattr(player, key, value)

    db.commit()
    db.refresh(player)
    return PlayerResponse.model_validate(player)


@router.delete("/{player_id}", status_code=204)
async def delete_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()


@router.get("/{player_id}/statistics", response_model=dict)
async def get_player_statistics(player_id: int, db: Session = Depends(get_db)):
    from app.models.statistics import Statistics

    stats = db.query(Statistics).filter(Statistics.player_id == player_id).all()
    if not stats:
        return {"player_id": player_id, "statistics": []}

    return {
        "player_id": player_id,
        "statistics": [
            {
                "id": s.id,
                "match_id": s.match_id,
                "distance_covered": s.distance_covered,
                "max_speed": s.max_speed,
                "avg_speed": s.avg_speed,
                "sprint_count": s.sprint_count,
                "goals": s.goals,
                "assists": s.assists,
                "rating": s.rating,
            }
            for s in stats
        ],
    }
