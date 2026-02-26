import React, { useEffect, useState } from "react";
import { listEmployees } from "../api/employees";
import {
  getAttendanceForEmployee,
  markAttendance,
} from "../api/attendance";

function AttendancePanel({ token }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Present");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listEmployees(token)
      .then((emps) => {
        setEmployees(emps);
        if (emps.length > 0) {
          setSelectedEmployeeId(String(emps[0].id));
        }
      })
      .catch((err) =>
        setError(err.message || "Failed to load employees for attendance")
      );
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    setError("");
    getAttendanceForEmployee(Number(selectedEmployeeId), token)
      .then(setAttendance)
      .catch((err) =>
        setError(err.message || "Failed to load attendance")
      )
      .finally(() => setLoading(false));
  }, [selectedEmployeeId]);

  const handleMark = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    setLoading(true);
    setError("");
    markAttendance(
      {
        employee_id: Number(selectedEmployeeId),
        date,
        status,
      },
      token
    )
      .then(() =>
        getAttendanceForEmployee(Number(selectedEmployeeId), token).then(
          setAttendance
        )
      )
      .catch((err) =>
        setError(err.message || "Failed to mark attendance")
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Mark Attendance</h2>
        <form onSubmit={handleMark} className="form">
          <label className="field">
            <span>Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.employee_id})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </label>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Attendance History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.date}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}

export default AttendancePanel;

