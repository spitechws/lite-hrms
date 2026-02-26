from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    """
    Unified user/employee table.

    - Application users (admin, manager, etc.) have username + email + role != 'employee'
    - Employees are rows with role='employee' and employee_id / department filled.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Optional username (login identity is stored in Auth; this is for display / linkage)
    username = Column(String, unique=True, index=True, nullable=True)

    email = Column(String, unique=True, index=True, nullable=False)

    # Employee-related fields
    employee_id = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    department = Column(String, nullable=True)

    # Role: e.g. "user", "admin", "employee"
    role = Column(String, nullable=False, default="user")

    is_active = Column(Boolean, default=True)

    attendance = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )


class Auth(Base):
    """
    Authentication table containing credentials and a generic link
    to the domain table that owns the identity (e.g. users).
    """

    __tablename__ = "auth"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    table_id = Column(Integer, nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # Present / Absent
    employee = relationship("User", back_populates="attendance")
