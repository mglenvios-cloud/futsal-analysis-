from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Futsal Analysis Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:////tmp/futsal.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "futsal_jwt_secret_key_2024_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://futsal-analysis.vercel.app"]

    MODEL_PATH: str = "/app/models/yolo"
    VIDEO_UPLOAD_PATH: str = "/app/data/videos"
    REPORT_PATH: str = "/app/data/reports"

    MAX_VIDEO_SIZE: int = 500 * 1024 * 1024
    ALLOWED_VIDEO_FORMATS: List[str] = [".mp4", ".avi", ".mov", ".mkv", ".webm"]

    BLUETOOTH_SCAN_TIMEOUT: int = 30
    HEART_RATE_MONITOR_INTERVAL: int = 5

    SCOUTING_INTERVAL_HOURS: int = 24
    SCOUTING_SOURCES: List[str] = [
        "https://www.afa.com.ar",
        "https://www.afa.com.ar/futsal",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
