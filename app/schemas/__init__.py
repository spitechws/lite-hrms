from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, constr


class UserBase(BaseModel):
    # Username can be nullable in the database (e.g. pure employees),
    # so treat it as optional in responses.
    username: Optional[str] = None
    email: EmailStr


class UserCreate(UserBase):
    # For registration, require a non-empty username explicitly.
    username: str
    password: constr(min_length=6, max_length=72)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    pin: Optional[str] = None
    city: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    is_active: bool
    # Optional profile fields (used when this row also represents an employee)
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    pin: Optional[str] = None
    city: Optional[str] = None
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


class ChangePasswordRequest(BaseModel):
    current_password: constr(min_length=6, max_length=72)
    new_password: constr(min_length=6, max_length=72)


class RefreshTokenRequest(BaseModel):
    refresh_token: constr(min_length=10)


class EmployeeBase(BaseModel):
    employee_id: str
    # First name is mandatory; other profile fields are optional.
    first_name: str
    email: EmailStr
    department: str
    last_name: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    pin: Optional[str] = None
    city: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    password: constr(min_length=6, max_length=72)


class Employee(EmployeeBase):
    id: int
    # Keep full_name for backwards compatibility in responses
    full_name: Optional[str] = None


class DepartmentBase(BaseModel):
    name: str
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class Department(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

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

