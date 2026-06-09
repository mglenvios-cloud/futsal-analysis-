from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TeamBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    coach: Optional[str] = None
    stadium: Optional[str] = None
    city: Optional[str] = None


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    coach: Optional[str] = None
    stadium: Optional[str] = None
    city: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None


class TeamResponse(TeamBase):
    id: int
    logo_url: Optional[str] = None
    country: Optional[str] = None
    founded_year: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    teams: list[TeamResponse]
