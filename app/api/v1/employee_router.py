from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, database, schemas
from app.service.auth_service import AuthServiceFactory

router = APIRouter(tags=["employees"])
auth_service = AuthServiceFactory.create()


@router.post("/", response_model=schemas.Employee, status_code=201)
def create_employee(
    employee: schemas.EmployeeCreate, db: Session = Depends(database.get_db)
):
    if not all(
        [
            employee.employee_id,
            employee.full_name,
            employee.email,
            employee.department,
            employee.password,
        ]
    ):
        raise HTTPException(status_code=422, detail="All fields are required.")

    password_hash = auth_service.get_password_hash(employee.password)
    return crud.create_employee(db, employee, password_hash)


@router.get("/", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(database.get_db)):
    return crud.get_employees(db)


@router.delete("/{employee_id}", response_model=schemas.Employee)
def delete_employee(employee_id: int, db: Session = Depends(database.get_db)):
    return crud.delete_employee(db, employee_id)
