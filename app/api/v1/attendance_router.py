from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", response_model=schemas.Attendance, status_code=201)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    if not all([attendance.employee_id, attendance.date, attendance.status]):
        raise HTTPException(status_code=422, detail="All fields are required.")
    if attendance.status not in ["Present", "Absent"]:
        raise HTTPException(status_code=422, detail="Status must be 'Present' or 'Absent'.")
    return crud.mark_attendance(db, attendance)

@router.get("/{employee_id}", response_model=list[schemas.Attendance])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    return crud.get_attendance_for_employee(db, employee_id)
