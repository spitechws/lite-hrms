from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.database import crud, get_db
from app.service.auth_service import AuthServiceFactory

router = APIRouter(tags=["employees"])
auth_service = AuthServiceFactory.create()


@router.post("/", response_model=schemas.Employee, status_code=201)
def create_employee(
    employee: schemas.EmployeeCreate, db: Session = Depends(get_db)
):
    password_hash = auth_service.get_password_hash(employee.password)
    return crud.create_employee(db, employee, password_hash)


@router.get("/", response_model=list[schemas.Employee])
def list_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)


@router.delete("/{employee_id}", response_model=schemas.Employee)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    return crud.delete_employee(db, employee_id)
