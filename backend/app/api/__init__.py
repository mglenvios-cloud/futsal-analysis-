from fastapi import APIRouter

router = APIRouter()

from app.api.players import router as players_router
from app.api.teams import router as teams_router
from app.api.matches import router as matches_router
from app.api.videos import router as videos_router
from app.api.analysis import router as analysis_router
from app.api.scouting import router as scouting_router
from app.api.cardiac import router as cardiac_router
from app.api.reports import router as reports_router
from app.api.predictions import router as predictions_router

router.include_router(players_router, prefix="/players", tags=["Players"])
router.include_router(teams_router, prefix="/teams", tags=["Teams"])
router.include_router(matches_router, prefix="/matches", tags=["Matches"])
router.include_router(videos_router, prefix="/videos", tags=["Videos"])
router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
router.include_router(scouting_router, prefix="/scouting", tags=["Scouting"])
router.include_router(cardiac_router, prefix="/cardiac", tags=["Cardiac"])
router.include_router(reports_router, prefix="/reports", tags=["Reports"])
router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
