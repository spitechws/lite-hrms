from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import database
from app.api.router import api_router
from app.config import get_settings

settings = get_settings()

database.init_db()

app = FastAPI(title="HRMS Lite Backend", version="0.1.0")

# Include API routers
app.include_router(api_router, prefix="/api/v1")

# Serve built frontend (Vite) from frontend/dist at the repo root.
ROOT_DIR = Path(__file__).resolve().parents[1]
frontend_dist = ROOT_DIR / "frontend" / "dist"
app.mount(
    "/",
    StaticFiles(directory=str(frontend_dist), html=True),
    name="frontend",
)

# Allow CORS for frontend (useful for dev / API calls)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

