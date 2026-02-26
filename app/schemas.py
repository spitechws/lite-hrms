from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date

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
        orm_mode = True

class AttendanceBase(BaseModel):
    date: date
    status: str  # Present / Absent

class AttendanceCreate(AttendanceBase):
    employee_id: int

class Attendance(AttendanceBase):
    id: int
    employee_id: int
    class Config:
        orm_mode = True
