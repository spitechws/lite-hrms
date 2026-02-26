
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import database
from app.api.router import api_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

database.init_db()

app = FastAPI()
# Serve static files from 'public' directory
app.mount("/", StaticFiles(directory="public", html=True), name="static")
# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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