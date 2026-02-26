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
        password
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
      <div className="app-shell">
        <div className="card">Loading...</div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return (
      <div className="app-shell">
        <h1>HRMS Lite</h1>
        <div className="grid-2">
          <div className="card">
            <h2>Login</h2>
            <LoginForm onLogin={handleLogin} />
          </div>
          <div className="card">
            <h2>Register</h2>
            <RegisterForm onRegister={handleRegister} />
          </div>
        </div>
        {error && <div className="error-banner">{error}</div>}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>HRMS Lite</h1>
          <span className="subtitle">
            Signed in as <strong>{currentUser.username}</strong>
          </span>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="tabs">
        <button
          className={activeView === "employees" ? "tab active" : "tab"}
          onClick={() => setActiveView("employees")}
        >
          Employees
        </button>
        <button
          className={activeView === "attendance" ? "tab active" : "tab"}
          onClick={() => setActiveView("attendance")}
        >
          Attendance
        </button>
        <button
          className={activeView === "users" ? "tab active" : "tab"}
          onClick={() => setActiveView("users")}
        >
          Users
        </button>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      <main>
        {activeView === "employees" && <EmployeeList token={token} />}
        {activeView === "attendance" && <AttendancePanel token={token} />}
        {activeView === "users" && <UsersList token={token} />}
      </main>
    </div>
  );
}

export default App;

