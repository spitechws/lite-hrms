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
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
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
    createEmployee(form, token)
      .then(() => {
        setForm({
          employee_id: "",
          full_name: "",
          email: "",
          department: "",
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
    <div className="grid-2">
      <div className="card">
        <h2>Employees</h2>
        {loading ? (
          <p>Loading...</p>
        ) : employees.length === 0 ? (
          <p>No employees yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.employee_id}</td>
                  <td>{e.full_name}</td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <div className="error-banner">{error}</div>}
      </div>

      <div className="card">
        <h2>Add Employee</h2>
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Employee ID</span>
            <input
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              placeholder="EMP001"
            />
          </label>
          <label className="field">
            <span>Full name</span>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </label>
          <label className="field">
            <span>Department</span>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Engineering"
            />
          </label>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeList;

