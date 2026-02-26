import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { login, getCurrentUser } from "./api/auth";
import EmployeeList from "./components/EmployeeList";
import AttendancePanel from "./components/AttendancePanel";
import UsersList from "./components/UsersList";
import DepartmentsList from "./components/DepartmentsList";
import LoginForm from "./components/LoginForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isEmployee = currentUser?.role === "employee";

  useEffect(() => {
    const savedToken = window.localStorage.getItem("hrms_token");
    const savedRefresh = window.localStorage.getItem("hrms_refresh_token");
    const savedUser = window.localStorage.getItem("hrms_user");

    if (!savedToken) {
      setLoadingUser(false);
      return;
    }

    setToken(savedToken);
    if (savedRefresh) {
      setRefreshToken(savedRefresh);
    }
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setLoadingUser(false);
        return;
      } catch {
        window.localStorage.removeItem("hrms_user");
      }
    }

    getCurrentUser(savedToken)
      .then((user) => {
        setCurrentUser(user);
        window.localStorage.setItem("hrms_user", JSON.stringify(user));
      })
      .catch(() => {
        window.localStorage.removeItem("hrms_token");
        window.localStorage.removeItem("hrms_refresh_token");
        window.localStorage.removeItem("hrms_user");
        setToken(null);
        setRefreshToken(null);
        setCurrentUser(null);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogin = async (username, password) => {
    setError("");
    try {
      const { access_token, refresh_token, user } = await login(
        username,
        password,
      );
      window.localStorage.setItem("hrms_token", access_token);
      window.localStorage.setItem("hrms_refresh_token", refresh_token);
      window.localStorage.setItem("hrms_user", JSON.stringify(user));
      setToken(access_token);
      setRefreshToken(refresh_token);
      setCurrentUser(user);
      navigate(user.role === "employee" ? "/attendance" : "/employees");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("hrms_token");
    window.localStorage.removeItem("hrms_refresh_token");
    window.localStorage.removeItem("hrms_user");
    setToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-slate-600 text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
              <div className="w-full max-w-5xl">
                <header className="mb-8 text-center">
                  <h1 className="text-3xl font-semibold text-slate-900">
                    HRMS Lite
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Simple HR management for employees and attendance.
                  </p>
                </header>
                <div className="max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Login
                  </h2>
                  <LoginForm onLogin={handleLogin} />
                  {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const menuItems = isEmployee
    ? [{ id: "attendance", label: "Attendance" }]
    : [
        { id: "employees", label: "Employees" },
        { id: "attendance", label: "Attendance" },
        { id: "users", label: "Users" },
        { id: "departments", label: "Departments" },
      ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-sm md:flex">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">
              HRMS Lite
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Signed in as{" "}
              <span className="font-medium text-slate-800">
                {currentUser.full_name ||
                  currentUser.username ||
                  currentUser.email}
              </span>
            </p>
            {currentUser.role && (
              <p className="mt-1">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  {currentUser.role}
                </span>
              </p>
            )}
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((tab) => (
              <NavLink
                key={tab.id}
                to={"/" + tab.id}
                className={({ isActive }) =>
                  `flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col px-4 py-6 md:px-6">
          <header className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
            <div className="md:hidden">
              <h1 className="text-2xl font-semibold text-slate-900">
                HRMS Lite
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Signed in as{" "}
                <span className="font-medium text-slate-800">
                  {currentUser.full_name ||
                    currentUser.username ||
                    currentUser.email}
                </span>
                {currentUser.role && (
                  <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {currentUser.role}
                  </span>
                )}
              </p>
            </div>

            {/* Simple top nav for small screens */}
            <nav className="flex flex-wrap gap-2 md:hidden">
              {menuItems.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={"/" + tab.id}
                  className={({ isActive }) =>
                    `inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${
                      isActive
                        ? "bg-sky-600 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            {/* User menu (desktop) */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50"
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <span className="mr-2">
                    {currentUser.full_name ||
                      currentUser.username ||
                      currentUser.email}
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
                    <button
                      className="block w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        navigate("/profile");
                        setUserMenuOpen(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        navigate("/change-password");
                        setUserMenuOpen(false);
                      }}
                    >
                      Change password
                    </button>
                    <button
                      className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
              onClick={handleLogout}
            >
              Logout
            </button>
          </header>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <main className="flex-1 space-y-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Navigate
                    to={isEmployee ? "/attendance" : "/employees"}
                    replace
                  />
                }
              />
              <Route
                path="/employees"
                element={
                  !isEmployee ? (
                    <EmployeeList token={token} />
                  ) : (
                    <Navigate to="/attendance" replace />
                  )
                }
              />
              <Route
                path="/attendance"
                element={
                  <AttendancePanel token={token} currentUser={currentUser} />
                }
              />
              <Route
                path="/users"
                element={
                  !isEmployee ? (
                    <UsersList token={token} />
                  ) : (
                    <Navigate to="/attendance" replace />
                  )
                }
              />
              <Route
                path="/departments"
                element={
                  !isEmployee ? (
                    <DepartmentsList token={token} />
                  ) : (
                    <Navigate to="/attendance" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-w-xl">
                    <h2 className="text-base font-semibold text-slate-900 mb-3">
                      Profile
                    </h2>
                    <dl className="space-y-2 text-sm text-slate-700">
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500">Name</dt>
                        <dd>
                          {currentUser.full_name ||
                            currentUser.username ||
                            currentUser.email}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500">Email</dt>
                        <dd>{currentUser.email}</dd>
                      </div>
                      {currentUser.employee_id && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-slate-500">
                            Employee ID
                          </dt>
                          <dd>{currentUser.employee_id}</dd>
                        </div>
                      )}
                      {currentUser.department && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-slate-500">
                            Department
                          </dt>
                          <dd>{currentUser.department}</dd>
                        </div>
                      )}
                      {currentUser.role && (
                        <div className="flex justify-between">
                          <dt className="font-medium text-slate-500">Role</dt>
                          <dd>{currentUser.role}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ChangePasswordForm
                    token={token}
                    onSuccess={() => setError("")}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

