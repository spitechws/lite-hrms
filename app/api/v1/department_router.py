from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import crud, get_db
from app.api.v1.auth_router import get_current_user


router = APIRouter(tags=["departments"])


@router.get("/", response_model=List[schemas.Department])
def list_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_departments(db)


@router.post("/", response_model=schemas.Department, status_code=201)
def create_department(
    department_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_department(db, department_in)


@router.put("/{department_id}", response_model=schemas.Department)
def update_department(
    department_id: int,
    department_in: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.update_department(db, department_id, department_in)


@router.delete("/{department_id}", response_model=schemas.Department)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.delete_department(db, department_id)


