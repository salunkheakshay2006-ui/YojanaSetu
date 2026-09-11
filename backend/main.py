import os
import sys
from contextlib import asynccontextmanager
from typing import Any, Optional, Union

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)
for p in [PARENT_DIR, BASE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.database import init_db, get_connection
    from backend.schemas import (
        APIResponse, SchemeResponse, FutureOpportunityResponse,
        CitizenProfileInput, RecommendationRequest, RecommendationResponse
    )
    from backend.crud import (
        get_all_schemes, get_scheme_by_id, search_schemes,
        get_future_opportunities
    )
    from backend.services.cleaner import run_cleaning_pipeline
    from backend.services.recommender import recommend_schemes
except ImportError:
    from database import init_db, get_connection
    from schemas import (
        APIResponse, SchemeResponse, FutureOpportunityResponse,
        CitizenProfileInput, RecommendationRequest, RecommendationResponse
    )
    from crud import (
        get_all_schemes, get_scheme_by_id, search_schemes,
        get_future_opportunities
    )
    from services.cleaner import run_cleaning_pipeline
    from services.recommender import recommend_schemes

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to initialize SQLite database and auto-seed if empty."""
    init_db()

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM schemes")
        count = cur.fetchone()[0]
        if count == 0:
            print("[FastAPI Startup] Schemes database is empty. Running auto-seeding pipeline...")
            run_cleaning_pipeline()
    except Exception as e:
        print(f"[FastAPI Startup] Seeding check warning: {e}")
    finally:
        conn.close()

    yield

app = FastAPI(
    title="AI Government Scheme Recommendation System API",
    description="FastAPI Backend for Government Schemes Search & Recommendation System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable permissive CORS for hackathon frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _unwrap(val: Any) -> Any:
    """Helper to unwrap FastAPI Query default wrappers when functions are called directly."""
    if hasattr(val, "default"):
        return val.default
    return val

@app.get("/api/health", response_model=APIResponse)
def health_check():
    """Health check endpoint."""
    return APIResponse(
        success=True,
        message="Backend API is running healthy.",
        data={"status": "active", "service": "AI Government Scheme Recommendation API"}
    )

@app.get("/api/schemes", response_model=APIResponse)
def list_schemes(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)):
    """Retrieve list of schemes with pagination."""
    skip = int(_unwrap(skip))
    limit = int(_unwrap(limit))

    schemes = get_all_schemes(skip=skip, limit=limit)
    return APIResponse(
        success=True,
        message=f"Successfully retrieved {len(schemes)} schemes.",
        data=schemes
    )

@app.get("/api/schemes/search", response_model=APIResponse)
def search_schemes_endpoint(
    category: Optional[str] = Query(None, description="Category filter"),
    state: Optional[str] = Query(None, description="State filter"),
    age: Optional[float] = Query(None, description="Target applicant age"),
    income: Optional[float] = Query(None, description="Annual family income limit"),
    occupation: Optional[str] = Query(None, description="Occupation filter"),
    education: Optional[str] = Query(None, description="Education level filter")
):
    """Search schemes based on filter criteria."""
    category = _unwrap(category)
    state = _unwrap(state)
    age = _unwrap(age)
    income = _unwrap(income)
    occupation = _unwrap(occupation)
    education = _unwrap(education)

    results = search_schemes(
        category=category,
        state=state,
        age=age,
        income=income,
        occupation=occupation,
        education=education
    )
    return APIResponse(
        success=True,
        message=f"Found {len(results)} schemes matching search criteria.",
        data=results
    )

@app.get("/api/schemes/{scheme_id}", response_model=APIResponse)
def get_scheme(scheme_id: str):
    """Retrieve details of a specific scheme by scheme_id."""
    scheme = get_scheme_by_id(scheme_id=scheme_id)
    if not scheme:
        return APIResponse(
            success=False,
            message=f"Scheme with ID '{scheme_id}' not found.",
            data=None
        )
    return APIResponse(
        success=True,
        message="Scheme details retrieved successfully.",
        data=scheme
    )

@app.get("/api/future-opportunities", response_model=APIResponse)
def list_future_opportunities():
    """Retrieve all future opportunity records."""
    opportunities = get_future_opportunities()
    return APIResponse(
        success=True,
        message=f"Successfully retrieved {len(opportunities)} future opportunity records.",
        data=opportunities
    )

@app.post("/api/recommend", response_model=APIResponse)
def recommend_endpoint(payload: Union[RecommendationRequest, CitizenProfileInput]):
    """
    Accepts applicant profile payload and returns recommended schemes,
    future opportunities, recommended bundle, explanation, and confidence score.
    """
    if hasattr(payload, "profile"):
        profile_data = payload.profile
    else:
        profile_data = payload

    recommendation_res = recommend_schemes(profile_data)
    return APIResponse(
        success=True,
        message="Scheme recommendation generated successfully.",
        data=recommendation_res
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
