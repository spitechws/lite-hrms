from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database

router = APIRouter(prefix="/employees", tags=["employees"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Employee, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if not all([employee.full_name, employee.email, employee.department]):
        raise HTTPException(status_code=422, detail="All fields are required.")
    return crud.create_employee(db, employee)

@router.get("/", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@router.delete("/{employee_id}", response_model=schemas.Employee)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    return crud.delete_employee(db, employee_id)
