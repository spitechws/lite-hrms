from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas
from fastapi import HTTPException, status
from typing import List
from datetime import date

def get_employees(db: Session) -> List[models.Employee]:
    return db.query(models.Employee).all()

def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employee_by_empid(db: Session, empid: str):
    return db.query(models.Employee).filter(models.Employee.employee_id == empid).first()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    try:
        db.commit()
        db.refresh(db_employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee ID or Email already exists.")
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return db_employee

def mark_attendance(db: Session, attendance: schemas.AttendanceCreate):
    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance_for_employee(db: Session, employee_id: int):
    return db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).all()
