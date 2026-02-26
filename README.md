# HRMS Lite Backend (FastAPI)

## Setup Instructions

### 1. Install dependencies
```
pip install -r requirements.txt
```

### 2. Run the server
```
uvicorn app.main:app --reload
```

- The API will be available at http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs

## API Endpoints

### Employees
- `POST /employees` — Add new employee
- `GET /employees` — List all employees
- `DELETE /employees/{employee_id}` — Delete employee

### Attendance
- `POST /attendance` — Mark attendance
- `GET /attendance/{employee_id}` — Get attendance for employee

## Notes
- Uses SQLite for persistence (file: hrms.db)
- No authentication (single admin assumed)
- Handles validation and error responses
