from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, constr


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: constr(min_length=6, max_length=72)


class User(UserBase):
    id: int
    is_active: bool
    # Optional profile fields (used when this row also represents an employee)
    full_name: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: constr(min_length=6, max_length=72)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: User


class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class EmployeeCreate(EmployeeBase):
    pass


class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    date: date
    status: str  # Present / Absent


class AttendanceCreate(AttendanceBase):
    employee_id: int


class Attendance(AttendanceBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True
