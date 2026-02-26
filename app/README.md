## HRMS Lite Backend (FastAPI)

FastAPI backend for a lightweight HRMS with employees, attendance, and JWT‑based user authentication.

### Tech stack

- **Python / FastAPI**
- **SQLAlchemy** (ORM) with **MySQL** (via `pymysql`) by default
- **Pydantic** for validation
- **JWT** via `python-jose`
- **Alembic** for database migrations

### Project layout

- `main.py` – FastAPI app entrypoint
- `models.py` – SQLAlchemy models (`User`, `Auth`, `Attendance`)
- `schemas.py` – Pydantic schemas
- `crud.py` – data access / CRUD helpers
- `api/` – versioned API routers
- `service/` – services (auth, etc.)
- `config.py` – central configuration (reads `.env`)
- `../alembic/` – migration environment and scripts

### Configuration (`.env`)

Create `.env` in the project root and set:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost/hrms_lite
SECRET_KEY=change_me_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:3000
```

### Install & run

1. **Create the MySQL database**

In MySQL, create a database (and user if needed) that matches your `DATABASE_URL`, for example:

```sql
CREATE DATABASE hrms_lite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Install dependencies**

From the project root:

```bash
pip install -r requirements.txt
```

This installs from `app/requirements.txt`.

3. **Run database migrations (Alembic)**

From the project root:

```bash
alembic upgrade head
```

4. **Seed the initial admin user (optional but recommended)**

From the project root:

```bash
python -m app.seed_initial_admin
```

This will create an initial admin user (`admin` / `admin123`) if it does not already exist.

5. **Start the API server**

From the project root:

```bash
uvicorn app.main:app --reload
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

- Default DB is a MySQL database at `mysql+pymysql://root:password@localhost/hrms_lite`; override with `DATABASE_URL` in `.env` for your own credentials/host/db.
- All config is centralized in `config.py` and read from `.env`.
