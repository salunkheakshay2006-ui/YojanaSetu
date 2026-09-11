"""
Profile router -- Citizen Profile API.

Routes
------
POST /api/profile         createCitizenProfile()
GET  /api/profile/{id}    getCitizenProfile()
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.citizen import CitizenCreate, CitizenProfile
from store import memory as store

router = APIRouter(prefix="/api")


@router.post("/profile", status_code=201)
def createCitizenProfile(body: CitizenCreate):
    """Create a new citizen profile and return it."""
    profile = CitizenProfile(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc),
        **body.model_dump(),
    )
    store.save_citizen(profile)

    return {
        "success": True,
        "message": "Profile created successfully",
        "data": profile.model_dump(mode="json"),
    }


@router.get("/profile/{id}")
def getCitizenProfile(id: str):
    """Fetch a citizen profile by its id."""
    profile = store.get_citizen(id)

    if profile is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"No profile found with id '{id}'",
                "data": {},
            },
        )

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": profile.model_dump(mode="json"),
    }
