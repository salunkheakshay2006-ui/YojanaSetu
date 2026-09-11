from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import Base, engine
import models.citizen_orm              # registers CitizenTable with Base
import models.scheme_orm               # registers SchemeTable with Base
import models.saved_scheme_orm         # registers SavedSchemeTable with Base
import models.application_tracker_orm # registers ApplicationTrackerTable with Base
import models.citizen_preferences_orm  # registers CitizenPreferencesTable with Base
import models.citizen_documents_orm    # registers CitizenDocumentsTable with Base
from routers.profile import router as profile_router
from routers.schemes import router as schemes_router
from routers.eligibility import router as eligibility_router
from routers.saved_schemes import router as saved_schemes_router
from routers.tracker import router as tracker_router
from routers.preferences import router as preferences_router
from routers.documents import router as documents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup (no-op if they already exist)."""
    Base.metadata.create_all(bind=engine)
    yield


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hackathon Task Manager API", lifespan=lifespan)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- routers ---
app.include_router(profile_router)
app.include_router(schemes_router)
app.include_router(eligibility_router)
app.include_router(saved_schemes_router)
app.include_router(tracker_router)
app.include_router(preferences_router)
app.include_router(documents_router)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "Backend is running",
        "data": {},
    }


