from fastapi import FastAPI

from routers.profile import router as profile_router

app = FastAPI(title="Hackathon Task Manager API")

# --- routers ---
app.include_router(profile_router)


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "Backend is running",
        "data": {},
    }
