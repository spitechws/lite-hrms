## HRMS Lite Frontend (React + Vite)

React SPA for managing employees, attendance, and authentication against the HRMS Lite FastAPI backend.

### Tech stack

- **React 18**
- **Vite** (dev server & build)
- Fetch API for HTTP calls

### Project layout

- `vite.config.js` – Vite config (dev server on port `3000`)
- `src/main.jsx` – React entry
- `src/App.jsx` – main shell, routing between tabs
- `src/api/` – small API client wrappers
  - `auth.js` – login, register, current user, list users
  - `employees.js` – employee CRUD
  - `attendance.js` – attendance endpoints
- `src/components/` – UI components
  - `LoginForm.jsx`, `RegisterForm.jsx`
  - `EmployeeList.jsx`
  - `AttendancePanel.jsx`
  - `UsersList.jsx`
- `src/styles.css` – global styles

### Backend URL configuration

The frontend reads the backend base URL from `VITE_API_BASE_URL`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

This is already set in `frontend/.env`. Change it if your backend runs elsewhere.

### Install & run

From the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

Make sure the backend server is running and CORS is configured to allow `http://localhost:3000`.

### Features wired to backend APIs

- **Authentication**
  - Register and login with username, email, and password.
  - Stores `access_token`, `refresh_token`, and user info in `localStorage`.
  - Loads current user on refresh using `/auth/me`.

- **Employees**
  - List all employees.
  - Create employee with `employee_id`, name, email, and department.
  - Delete employee.

- **Attendance**
  - Choose an employee.
  - Mark attendance (`Present` / `Absent`) for a given date.
  - View attendance history for the selected employee.

- **Users**
  - List all registered users using `/auth/users`.

