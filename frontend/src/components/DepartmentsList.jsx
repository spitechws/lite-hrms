import React, { useEffect, useState } from "react";
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../api/departments";
import InputField from "./ui/InputField";
import PrimaryButton from "./ui/PrimaryButton";

function DepartmentsList({ token }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    is_active: true,
  });

  const loadDepartments = () => {
    setLoading(true);
    setError("");
    listDepartments(token)
      .then(setDepartments)
      .catch((err) =>
        setError(err.message || "Failed to load departments"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm({ name: "", is_active: true });
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setForm({ name: dept.name, is_active: dept.is_active });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      is_active: form.is_active,
    };
    const op = editingId
      ? updateDepartment(editingId, payload, token)
      : createDepartment(payload, token);

    op
      .then(() => {
        startCreate();
        loadDepartments();
      })
      .catch((err) =>
        setError(err.message || "Failed to save department"),
      )
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this department?")) return;
    deleteDepartment(id, token)
      .then(() => loadDepartments())
      .catch((err) =>
        setError(err.message || "Failed to delete department"),
      );
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          Departments
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading departments…</p>
        ) : departments.length === 0 ? (
          <p className="text-sm text-slate-500">No departments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{d.name}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {d.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        onClick={() => startEdit(d)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(d.id)}
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
          {editingId ? "Edit Department" : "Add Department"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            label="Department name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Development"
            required
          />
          <label className="inline-flex items-center space-x-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>Active</span>
          </label>
          <div className="flex items-center gap-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
            {editingId && (
              <button
                type="button"
                className="text-xs font-medium text-slate-600 hover:underline"
                onClick={startCreate}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentsList;

