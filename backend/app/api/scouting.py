from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.models.scouting import ScoutingData
from app.services.scouting.agent import ScoutingAgent

router = APIRouter()
_scouting_agent = None


def get_scouting_agent():
    global _scouting_agent
    if _scouting_agent is None:
        _scouting_agent = ScoutingAgent()
    return _scouting_agent


@router.post("/run")
async def run_scouting(db: Session = Depends(get_db)):
    players = get_scouting_agent().run_full_scout()

    count = 0
    for p in players:
        existing = (
            db.query(ScoutingData)
            .filter(
                ScoutingData.player_name == p.name,
                ScoutingData.club == p.club,
            )
            .first()
        )

        if not existing:
            scouted = ScoutingData(
                player_name=p.name,
                player_surname=p.surname,
                club=p.club,
                category="Division A",
                age=p.age,
                position=p.position,
                height=p.height,
                weight=p.weight,
                goals=p.goals,
                assists=p.assists,
                yellow_cards=p.yellow_cards,
                red_cards=p.red_cards,
                minutes_played=p.minutes_played,
                matches_played=p.matches_played,
                source_url=p.source_url,
            )
            db.add(scouted)
            count += 1

    db.commit()

    return {
        "status": "completed",
        "players_found": len(players),
        "new_players_saved": count,
        "category": "Division A",
    }


@router.get("/players")
async def list_scouted_players(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    club: Optional[str] = None,
    position: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ScoutingData)
    if club:
        query = query.filter(ScoutingData.club.ilike(f"%{club}%"))
    if position:
        query = query.filter(ScoutingData.position == position)

    query = query.filter(ScoutingData.category == "Division A")

    total = query.count()
    players = query.order_by(ScoutingData.goals.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "category": "Division A",
        "players": [
            {
                "id": p.id,
                "name": f"{p.player_name} {p.player_surname or ''}",
                "club": p.club,
                "position": p.position,
                "age": p.age,
                "goals": p.goals,
                "assists": p.assists,
                "matches_played": p.matches_played,
            }
            for p in players
        ],
    }


@router.get("/players/{player_id}")
async def get_scouted_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(ScoutingData).filter(ScoutingData.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return {
        "id": player.id,
        "name": f"{player.player_name} {player.player_surname or ''}",
        "club": player.club,
        "category": player.category,
        "position": player.position,
        "age": player.age,
        "height": player.height,
        "weight": player.weight,
        "goals": player.goals,
        "assists": player.assists,
        "yellow_cards": player.yellow_cards,
        "red_cards": player.red_cards,
        "minutes_played": player.minutes_played,
        "matches_played": player.matches_played,
        "source_url": player.source_url,
        "last_scouted": str(player.last_scouted) if player.last_scouted else None,
    }


@router.post("/search")
async def search_player(name: str, db: Session = Depends(get_db)):
    result = scouting_agent.search_player_info(name)

    if not result:
        existing = (
            db.query(ScoutingData)
            .filter(ScoutingData.player_name.ilike(f"%{name}%"))
            .first()
        )
        if existing:
            return {
                "found": True,
                "source": "database",
                "player": {
                    "name": f"{existing.player_name} {existing.player_surname or ''}",
                    "club": existing.club,
                    "position": existing.position,
                    "goals": existing.goals,
                    "assists": existing.assists,
                },
            }
        return {"found": False, "message": "Player not found"}

    return {
        "found": True,
        "source": "web_scout",
        "player": {
            "name": result.name,
            "surname": result.surname,
            "club": result.club,
            "position": result.position,
            "age": result.age,
        },
    }


@router.get("/stats")
async def get_scouting_stats(db: Session = Depends(get_db)):
    total = db.query(ScoutingData).filter(ScoutingData.category == "Division A").count()
    top_scorers = (
        db.query(ScoutingData)
        .filter(ScoutingData.category == "Division A")
        .order_by(ScoutingData.goals.desc())
        .limit(10)
        .all()
    )
    clubs = (
        db.query(ScoutingData.club)
        .filter(
            ScoutingData.club.isnot(None),
            ScoutingData.category == "Division A",
        )
        .distinct()
        .count()
    )

    return {
        "total_players": total,
        "total_clubs": clubs,
        "category": "Division A",
        "top_scorers": [
            {
                "name": f"{p.player_name} {p.player_surname or ''}",
                "club": p.club,
                "goals": p.goals,
            }
            for p in top_scorers
        ],
    }
