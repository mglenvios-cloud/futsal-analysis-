from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.models.player import Player
from app.models.team import Team
from app.models.match import Match
from app.models.statistics import Statistics
from app.services.reports.generator import ReportGenerator

router = APIRouter()
_report_generator = None


def get_report_generator():
    global _report_generator
    if _report_generator is None:
        _report_generator = ReportGenerator()
    return _report_generator


@router.get("/player/{player_id}/pdf")
async def export_player_pdf(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    stats = db.query(Statistics).filter(Statistics.player_id == player_id).all()

    physical = {}
    if stats:
        s = stats[0]
        physical = {
            "distance_covered": s.distance_covered,
            "max_speed": s.max_speed,
            "avg_speed": s.avg_speed,
            "sprint_count": s.sprint_count,
            "accelerations": s.accelerations,
            "direction_changes": s.direction_changes,
            "time_moving": s.time_moving,
            "intensity_index": s.intensity_index,
        }

    player_data = {
        "name": player.name,
        "surname": player.surname,
        "age": player.age,
        "position": player.position,
        "team_name": player.team.name if player.team else None,
    }

    pdf_bytes = get_report_generator().generate_player_report(
        player_data=player_data,
        physical_metrics=physical,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=player_{player_id}_report.pdf"
        },
    )


@router.get("/team/{team_id}/pdf")
async def export_team_pdf(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    players = db.query(Player).filter(Player.team_id == team_id).all()
    players_data = [
        {
            "name": p.name,
            "surname": p.surname,
            "position": p.position,
            "goals": 0,
            "assists": 0,
            "rating": 0,
        }
        for p in players
    ]

    pdf_bytes = get_report_generator().generate_team_report(
        team_data={"name": team.name},
        players_data=players_data,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=team_{team_id}_report.pdf"
        },
    )


@router.get("/match/{match_id}/pdf")
async def export_match_pdf(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    events = [
        {
            "minute": e.minute,
            "event_type": e.event_type,
            "player_name": f"{e.player.name} {e.player.surname}" if e.player else None,
            "description": e.description,
        }
        for e in match.events
    ]

    match_data = {
        "home_team": match.home_team.name if match.home_team else "Local",
        "away_team": match.away_team.name if match.away_team else "Visitante",
        "home_score": match.home_score,
        "away_score": match.away_score,
    }

    pdf_bytes = get_report_generator().generate_match_report(
        match_data=match_data,
        events=events,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=match_{match_id}_report.pdf"
        },
    )


@router.get("/player/{player_id}/excel")
async def export_player_excel(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    stats = db.query(Statistics).filter(Statistics.player_id == player_id).all()

    sheets = [
        {
            "name": "Informacion",
            "headers": ["Campo", "Valor"],
            "rows": [
                ["Nombre", player.name],
                ["Apellido", player.surname],
                ["Edad", str(player.age)],
                ["Posicion", player.position or ""],
                ["Altura", str(player.height)],
                ["Peso", str(player.weight)],
            ],
        },
        {
            "name": "Estadisticas",
            "headers": ["Partido", "Goles", "Asistencias", "Distancia", "Vel.Max", "Rating"],
            "rows": [
                [
                    str(s.match_id),
                    s.goals,
                    s.assists,
                    s.distance_covered,
                    s.max_speed,
                    s.rating,
                ]
                for s in stats
            ],
        },
    ]

    excel_bytes = get_report_generator().generate_excel_report(
        title=f"Reporte {player.name} {player.surname}",
        sheets=sheets,
    )

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=player_{player_id}_report.xlsx"
        },
    )


@router.get("/player/{player_id}/csv")
async def export_player_csv(player_id: int, db: Session = Depends(get_db)):
    stats = db.query(Statistics).filter(Statistics.player_id == player_id).all()

    headers = ["Partido", "Goles", "Asistencias", "Distancia", "Vel.Max", "Rating"]
    rows = [
        [str(s.match_id), s.goals, s.assists, s.distance_covered, s.max_speed, s.rating]
        for s in stats
    ]

    csv_content = get_report_generator().generate_csv_report(headers=headers, rows=rows)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=player_{player_id}_stats.csv"
        },
    )
