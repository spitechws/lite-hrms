import React, { useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
} from "../api/employees";

function EmployeeList({ token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "Development",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = () => {
    setLoading(true);
    setError("");
    listEmployees(token)
      .then(setEmployees)
      .catch((err) => setError(err.message || "Failed to load employees"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Generate a simple employee_id on the client side.
    const generatedId = `EMP-${Date.now()}`;
    const payload = { employee_id: generatedId, ...form };
    createEmployee(payload, token)
      .then(() => {
        setForm({
          full_name: "",
          email: "",
          department: "",
          password: "",
        });
        loadEmployees();
      })
      .catch((err) => setError(err.message || "Failed to create employee"))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this employee?")) return;
    deleteEmployee(id, token)
      .then(() => loadEmployees())
      .catch((err) => setError(err.message || "Failed to delete employee"));
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Employees
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading employees…</p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-slate-500">No employees yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Employee ID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Department
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      {e.employee_id}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {e.full_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{e.email}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {e.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(e.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Add Employee
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="Development">Development</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Temporary password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Set a login password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeList;

