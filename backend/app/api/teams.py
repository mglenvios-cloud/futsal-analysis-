from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.models.team import Team
from app.models.player import Player
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamListResponse

router = APIRouter()


@router.get("/", response_model=TeamListResponse)
async def list_teams(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Team)
    if search:
        query = query.filter(Team.name.ilike(f"%{search}%"))
    total = query.count()
    teams = query.offset((page - 1) * page_size).limit(page_size).all()
    return TeamListResponse(
        total=total,
        page=page,
        page_size=page_size,
        teams=[TeamResponse.model_validate(t) for t in teams],
    )


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return TeamResponse.model_validate(team)


@router.post("/", response_model=TeamResponse, status_code=201)
async def create_team(team_data: TeamCreate, db: Session = Depends(get_db)):
    team = Team(**team_data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return TeamResponse.model_validate(team)


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(team_id: int, team_data: TeamUpdate, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    for key, value in team_data.model_dump(exclude_unset=True).items():
        setattr(team, key, value)
    db.commit()
    db.refresh(team)
    return TeamResponse.model_validate(team)


@router.get("/{team_id}/players")
async def get_team_players(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    players = db.query(Player).filter(Player.team_id == team_id).all()
    return {
        "team_id": team_id,
        "team_name": team.name,
        "players_count": len(players),
        "players": [
            {
                "id": p.id,
                "name": f"{p.name} {p.surname}",
                "position": p.position,
                "jersey_number": p.jersey_number,
                "age": p.age,
            }
            for p in players
        ],
    }
