from datetime import date
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(
    db: Session, user_in: schemas.UserCreate, password_hash: str
) -> models.User:
    db_user = models.User(
        username=user_in.username,
        email=user_in.email,
        password_hash=password_hash,
    )
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        )
    return db_user


def get_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()


def get_employees(db: Session) -> List[models.Employee]:
    return db.query(models.Employee).all()


def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def get_employee_by_empid(db: Session, empid: str):
    return (
        db.query(models.Employee).filter(models.Employee.employee_id == empid).first()
    )


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    try:
        db.commit()
        db.refresh(db_employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee ID or Email already exists.",
        )
    return db_employee


def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return db_employee


def mark_attendance(db: Session, attendance: schemas.AttendanceCreate):
    # Prevent duplicate attendance for the same employee on the same date.
    existing = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == attendance.employee_id,
            models.Attendance.date == attendance.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance for this date is already recorded.",
        )

    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance_for_employee(db: Session, employee_id: int):
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee_id)
        .all()
    )
