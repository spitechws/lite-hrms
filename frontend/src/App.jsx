import React, { useEffect, useState } from "react";
import { login, register, getCurrentUser } from "./api/auth";
import EmployeeList from "./components/EmployeeList";
import AttendancePanel from "./components/AttendancePanel";
import UsersList from "./components/UsersList";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("employees");
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

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
        setCurrentUser(JSON.parse(savedUser));
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
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleRegister = async (data) => {
    setError("");
    try {
      await register(data);
      await handleLogin(data.username, data.password);
    } catch (err) {
      setError(err.message || "Registration failed");
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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Login
              </h2>
              <LoginForm onLogin={handleLogin} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Register
              </h2>
              <RegisterForm onRegister={handleRegister} />
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              HRMS Lite
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as{" "}
              <span className="font-medium text-slate-800">
                {currentUser.username}
              </span>
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <nav className="mb-4 flex flex-wrap gap-2">
          {[
            { id: "employees", label: "Employees" },
            { id: "attendance", label: "Attendance" },
            { id: "users", label: "Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${
                activeView === tab.id
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setActiveView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <main className="flex-1 space-y-4">
          {activeView === "employees" && <EmployeeList token={token} />}
          {activeView === "attendance" && <AttendancePanel token={token} />}
          {activeView === "users" && <UsersList token={token} />}
        </main>
      </div>
    </div>
  );
}

export default App;

