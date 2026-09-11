"""
Schemes router -- Government Scheme API.

Routes
------
GET /api/schemes        getAllSchemes()
GET /api/schemes/{id}   getSchemeById()
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from store import scheme_store as store

router = APIRouter(prefix="/api")


@router.get("/schemes")
def getAllSchemes():
    """Return all government schemes stored in the database."""
    schemes = store.get_all_schemes()

    return {
        "success": True,
        "message": f"{len(schemes)} schemes found",
        "data": [s.model_dump(mode="json") for s in schemes],
    }


@router.get("/schemes/{id}")
def getSchemeById(id: str):
    """Return one government scheme by its id."""
    scheme = store.get_scheme_by_id(id)

    if scheme is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"No scheme found with id '{id}'",
                "data": {},
            },
        )

    return {
        "success": True,
        "message": "Scheme fetched successfully",
        "data": scheme.model_dump(mode="json"),
    }
