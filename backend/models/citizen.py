"""
Pydantic models for the Citizen resource.

CitizenCreate  -- shape of the POST /api/profile request body.
CitizenProfile -- full citizen record (includes id and created_at).
"""

import enum
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class CategoryEnum(str, enum.Enum):
    general = "General"
    obc = "OBC"
    sc = "SC"
    st = "ST"


class CitizenCreate(BaseModel):
    """Fields the caller must supply when creating a profile."""

    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=120)
    gender: GenderEnum
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    income: float = Field(..., ge=0, description="Annual income in INR")
    occupation: str = Field(..., min_length=2, max_length=100)
    education: str = Field(..., min_length=2, max_length=100)
    category: CategoryEnum
    is_student: bool = False
    is_farmer: bool = False
    is_disabled: bool = False


class CitizenProfile(CitizenCreate):
    """Full citizen record -- extends CitizenCreate with server-set fields."""

    id: str
    created_at: datetime


class ApiResponse(BaseModel):
    """Standard API response envelope used by every route."""

    success: bool
    message: str
    data: Any = {}
