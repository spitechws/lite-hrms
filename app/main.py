from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import init_db
from app.api.router import api_router
from app.config import get_settings

settings = get_settings()

init_db()

app = FastAPI(title="HRMS Lite Backend", version="0.1.0")

# Include API routers
app.include_router(api_router, prefix="/api/v1")

# Paths for built frontend (Vite)
ROOT_DIR = Path(__file__).resolve().parents[1]
frontend_dist = ROOT_DIR / "frontend" / "dist"
index_html = frontend_dist / "index.html"

# Serve built assets (JS/CSS) from /static/
app.mount(
    "/static",
    StaticFiles(directory=str(frontend_dist), html=False),
    name="frontend_static",
)


@app.get("/", include_in_schema=False)
async def serve_root() -> FileResponse:
    """
    Serve the SPA index for the root path.
    """
    return FileResponse(index_html)


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str) -> FileResponse:
    """
    Serve the SPA index for any non-API path (enables BrowserRouter reloads).
    """
    # Let API routes fall through to their own handlers
    if full_path.startswith("api/"):
        # FastAPI/Starlette will try the next matching route and return 404
        # if none match. We intentionally don't handle /api/* here.
        raise RuntimeError("API route should not be handled by SPA fallback")

    return FileResponse(index_html)


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

    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)

