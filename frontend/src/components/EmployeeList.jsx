import React, { useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
} from "../api/employees";
import { listDepartments } from "../api/departments";
import InputField from "./ui/InputField";
import SelectField from "./ui/SelectField";
import PrimaryButton from "./ui/PrimaryButton";

function EmployeeList({ token }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "Development",
    gender: "",
    address: "",
    pin: "",
    city: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const generateNextEmployeeId = (existingEmployees) => {
    if (!existingEmployees || existingEmployees.length === 0) {
      return "EMP-0001";
    }

    const maxNumber = existingEmployees.reduce((max, e) => {
      const match = typeof e.employee_id === "string" && e.employee_id.match(/^EMP-(\d+)$/);
      if (!match) return max;
      const num = parseInt(match[1], 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const next = maxNumber + 1;
    return `EMP-${String(next).padStart(4, "0")}`;
  };

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
    // Load departments for the dropdown; fall back to defaults if none.
    listDepartments(token)
      .then((items) => {
        setDepartments(items);
        if (items.length > 0) {
          setForm((prev) => ({
            ...prev,
            department: items[0].name,
          }));
        }
      })
      .catch(() => {
        // Ignore errors here; the form will still show fallback options.
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    // Generate a sequential employee_id like EMP-0001, EMP-0002, ...
    const generatedId = generateNextEmployeeId(employees);
    const payload = { employee_id: generatedId, ...form };
    createEmployee(payload, token)
      .then(() => {
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          department: "Development",
          gender: "",
          address: "",
          pin: "",
          city: "",
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
                    First name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Last name
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
                      {e.first_name || e.full_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {e.last_name || ""}
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
          <InputField
            label="First name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="John"
            required
          />
          <InputField
            label="Last name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Doe"
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select gender (optional)</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </SelectField>
          <InputField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, area"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField
              label="PIN code"
              name="pin"
              value={form.pin}
              onChange={handleChange}
              placeholder="Postal code"
            />
            <InputField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <SelectField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
          >
            {departments.length === 0 ? (
              <>
                <option value="Development">Development</option>
                <option value="QA">QA</option>
              </>
            ) : (
              departments
                .filter((d) => d.is_active)
                .map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))
            )}
          </SelectField>
          <InputField
            label="Temporary password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Set a login password"
            withToggle
          />
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export default EmployeeList;

