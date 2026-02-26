from fastapi import APIRouter
from app.api.v1.employee_router import router as employee_router
from app.api.v1.attendance_router import router as attendance_router

api_router = APIRouter()
api_router.include_router(employee_router,prefix="/employees", tags=["employees"])
api_router.include_router(attendance_router,prefix="/attendance", tags=["attendance"])
