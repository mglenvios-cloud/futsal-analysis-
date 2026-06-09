from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class PlayerBase(BaseModel):
    name: str
    surname: str
    date_of_birth: Optional[date] = None
    position: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    dominant_foot: Optional[str] = None
    jersey_number: Optional[int] = None
    team_id: Optional[int] = None
    category: Optional[str] = None


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    date_of_birth: Optional[date] = None
    position: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    dominant_foot: Optional[str] = None
    jersey_number: Optional[int] = None
    team_id: Optional[int] = None
    category: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: Optional[bool] = None


class PlayerResponse(PlayerBase):
    id: int
    unique_id: str
    age: Optional[int] = None
    photo_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlayerListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    players: list[PlayerResponse]
