from datetime import date
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas


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
    )
    db.add(db_user)
    try:
        # Flush to get an id for the user, then create the Auth row
        # in the same transaction.
        db.flush()

        auth = models.Auth(
            username=user_in.username,
            password_hash=password_hash,
            table_name=models.User.__tablename__,
            table_id=db_user.id,
        )
        db.add(auth)

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
    """
    Return all non-employee users (e.g. admins, managers, standard users).
    Employees are represented by User rows with role='employee' and are
    excluded from this listing.
    """
    return (
        db.query(models.User)
        .filter(models.User.role != "employee")
        .all()
    )


def get_employees(db: Session) -> List[models.User]:
    """
    Return all employees, represented by User rows with role='employee'.
    """
    return db.query(models.User).filter(models.User.role == "employee").all()


def get_employee(db: Session, employee_id: int):
    """
    Fetch a single employee (User row) by primary key, restricted to role='employee'.
    """
    return (
        db.query(models.User)
        .filter(models.User.id == employee_id, models.User.role == "employee")
        .first()
    )


def get_employee_by_empid(db: Session, empid: str):
    """
    Look up an employee by their business employee_id, restricted to role='employee'.
    """
    return (
        db.query(models.User)
        .filter(
            models.User.employee_id == empid,
            models.User.role == "employee",
        )
        .first()
    )


def create_employee(
    db: Session, employee: schemas.EmployeeCreate, password_hash: str
):
    """
    Create a new employee backed by the unified User table.

    Employees are Users with role='employee' and their employee-specific
    profile fields populated. A matching Auth row is created so the
    employee can log in.
    """
    db_employee = models.User(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department,
        role="employee",
        is_active=True,
    )
    db.add(db_employee)
    try:
        # Flush to get an id for the employee, then create the Auth row
        # in the same transaction.
        db.flush()

        auth = models.Auth(
            # Use email as the login identifier for employees.
            username=employee.email,
            password_hash=password_hash,
            table_name=models.User.__tablename__,
            table_id=db_employee.id,
        )
        db.add(auth)

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
    # Ensure the employee exists before recording attendance.
    employee = get_employee(db, attendance.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

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

