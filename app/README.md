## HRMS Lite Backend (FastAPI)

FastAPI backend for a lightweight HRMS with employees, attendance, and JWT‑based user authentication.

### Tech stack

- **Python / FastAPI**
- **SQLAlchemy** (ORM) with **SQLite** by default
- **Pydantic** for validation
- **JWT** via `python-jose`
- **Alembic** for database migrations

### Project layout

- `../main.py` – FastAPI app entrypoint
- `models.py` – SQLAlchemy models (`User`, `Employee`, `Attendance`)
- `schemas.py` – Pydantic schemas
- `crud.py` – data access / CRUD helpers
- `api/` – versioned API routers
- `service/` – services (auth, etc.)
- `config.py` – central configuration (reads `.env`)
- `../alembic/` – migration environment and scripts

### Configuration (`.env`)

Create `.env` in the project root and set:

```env
DATABASE_URL=sqlite:///./app/hrms.db
SECRET_KEY=change_me_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:3000
```

### Install & run

1. **Install dependencies**

From the project root:

```bash
pip install -r requirements.txt
```

This installs from `app/requirements.txt`.

2. **Run database migrations (Alembic)**

From the project root:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

3. **Start the API server**

From the project root:

```bash
uvicorn main:app --reload
```

- API base: `http://127.0.0.1:8000/api/v1`
- Docs: `http://127.0.0.1:8000/docs`

### Main API endpoints

- **Auth**
  - `POST /api/v1/auth/register` – register user
  - `POST /api/v1/auth/login` – login, returns `{ access_token, refresh_token, user }`
  - `GET  /api/v1/auth/me` – current user (JWT required)
  - `GET  /api/v1/auth/users` – list users (JWT required)

- **Employees**
  - `POST /api/v1/employees/` – add employee
  - `GET  /api/v1/employees/` – list employees
  - `DELETE /api/v1/employees/{employee_id}` – delete employee

- **Attendance**
  - `POST /api/v1/attendance` – mark attendance
  - `GET  /api/v1/attendance/{employee_id}` – get attendance for an employee

### Notes

- Default DB is `app/hrms.db`; override with `DATABASE_URL` if needed.
- All config is centralized in `config.py` and read from `.env`.
