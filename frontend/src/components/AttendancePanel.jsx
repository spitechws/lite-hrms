import React, { useEffect, useMemo, useState } from "react";
import { listEmployees } from "../api/employees";
import {
  getAttendanceForEmployee,
  markAttendance,
} from "../api/attendance";

function AttendancePanel({ token, currentUser }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Present");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmployee = currentUser?.role === "employee";

  const todayAlreadyMarked = useMemo(
    () => attendance.some((a) => a.date === date),
    [attendance, date],
  );

  // Admin/user: load all employees and allow selection.
  useEffect(() => {
    if (isEmployee) {
      setSelectedEmployeeId(String(currentUser.id));
      return;
    }

    listEmployees(token)
      .then((emps) => {
        setEmployees(emps);
        if (emps.length > 0) {
          setSelectedEmployeeId(String(emps[0].id));
        }
      })
      .catch((err) =>
        setError(err.message || "Failed to load employees for attendance"),
      );
  }, [isEmployee, token, currentUser]);

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
    if (!selectedEmployeeId || todayAlreadyMarked) return;
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
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Mark Attendance
        </h2>
        <form onSubmit={handleMark} className="space-y-3">
          {isEmployee ? (
            <div>
              <p className="text-sm text-slate-600">
                Mark attendance for{" "}
                <span className="font-medium">
                  {currentUser.full_name || currentUser.username}
                </span>
                .
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.employee_id})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
          <button
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading || todayAlreadyMarked}
          >
            {todayAlreadyMarked
              ? "Already marked for today"
              : loading
                ? "Saving…"
                : "Save"}
          </button>
        </form>
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Attendance History
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading attendance…</p>
        ) : attendance.length === 0 ? (
          <p className="text-sm text-slate-500">No attendance records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{a.id}</td>
                    <td className="px-3 py-2 text-slate-700">{a.date}</td>
                    <td className="px-3 py-2 text-slate-700">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePanel;

