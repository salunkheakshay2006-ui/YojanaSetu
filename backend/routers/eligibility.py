from typing import Optional
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from store import memory as citizen_store
from store import scheme_store
from services import eligibility as engine
from services import conflict as conflict_engine
from services import bundle as bundle_engine
from services import checklist as checklist_engine
from services import optimizer as optimizer_engine

router = APIRouter(prefix="/api")


@router.get("/eligibility/{citizen_id}")
def checkEligibility(
    citizen_id: str,
    goals: Optional[str] = None,
    available_docs: Optional[str] = None,
):
    """Check a citizen against all 20 schemes using structured eligibility rules."""
    citizen = citizen_store.get_citizen(citizen_id)
    if citizen is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": f"No citizen profile found with id {citizen_id!r}",
                "data": {},
            },
        )

    # Parse citizen's available documents set if supplied
    avail_set = None
    if available_docs is not None:
        avail_set = {d.strip() for d in available_docs.split(",") if d.strip()}

    schemes   = scheme_store.get_all_schemes()
    report    = engine.run_eligibility(citizen, schemes)
    conflicts = conflict_engine.run_conflict_detection(citizen, schemes)
    bundle    = bundle_engine.optimize_bundle(citizen, report, conflicts)
    checklist = checklist_engine.generate_application_checklist(citizen, bundle, available_docs=avail_set)
    optimized = optimizer_engine.run_optimization(citizen, report, conflicts, checklist, goals)

    s = report["summary"]

    return {
        "success": True,
        "message": (
            f"Eligibility check complete for {citizen.name}. "
            f"{s['possibly_eligible']} possibly eligible, "
            f"{s['confirmed_eligible']} confirmed eligible, "
            f"{s['not_eligible']} not eligible."
        ),
        "data": {
            **report,
            "conflicts": conflicts,
            "bundle": bundle,
            "checklist": checklist,
            "optimized_combinations": optimized,
        },
    }
