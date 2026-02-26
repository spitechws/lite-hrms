
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, crud, database
from fastapi.middleware.cors import CORSMiddleware

database.init_db()
app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "HRMS Lite Backend Running"}

# Employee Endpoints
from .utils import validate_email

@app.post("/employees", response_model=schemas.Employee, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Required fields check (Pydantic handles this, but double-check for clarity)
    if not all([employee.employee_id, employee.full_name, employee.email, employee.department]):
        raise HTTPException(status_code=422, detail="All fields are required.")
    validate_email(employee.email)
    return crud.create_employee(db, employee)

@app.get("/employees", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@app.delete("/employees/{employee_id}", response_model=schemas.Employee)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    return crud.delete_employee(db, employee_id)

# Attendance Endpoints
@app.post("/attendance", response_model=schemas.Attendance, status_code=201)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    if not all([attendance.employee_id, attendance.date, attendance.status]):
        raise HTTPException(status_code=422, detail="All fields are required.")
    if attendance.status not in ["Present", "Absent"]:
        raise HTTPException(status_code=422, detail="Status must be 'Present' or 'Absent'.")
    return crud.mark_attendance(db, attendance)

@app.get("/attendance/{employee_id}", response_model=list[schemas.Attendance])
def get_attendance(employee_id: int, db: Session = Depends(get_db)):
    return crud.get_attendance_for_employee(db, employee_id)
