
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import database
from app.api.router import api_router
from app.config import get_settings

settings = get_settings()

database.init_db()

app = FastAPI(title="HRMS Lite Backend", version="0.1.0")

# Serve static files from 'public' directory under /public
app.mount("/public", StaticFiles(directory="public", html=True), name="static")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "HRMS Lite Backend Running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)