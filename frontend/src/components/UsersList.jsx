import React, { useEffect, useState } from "react";
import { listUsers, createUser, updateUser } from "../api/auth";
import InputField from "./ui/InputField";
import SelectField from "./ui/SelectField";
import PrimaryButton from "./ui/PrimaryButton";

function UsersList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "user",
    is_active: true,
  });

  const loadUsers = () => {
    setLoading(true);
    setError("");
    listUsers(token)
      .then(setUsers)
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setForm({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "user",
      is_active: user.is_active ?? true,
    });
  };

  const resetForm = () => {
    setEditingUserId(null);
    setForm({
      username: "",
      email: "",
      role: "user",
      is_active: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingUserId) {
        await updateUser(token, editingUserId, {
          username: form.username,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        });
      } else {
        await createUser(token, {
          username: form.username,
          email: form.email,
          role: form.role,
          password: form.password, // optional; backend requires password only on create
        });
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-3">Users</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Username
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Role
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Active
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">
                      {u.username || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{u.email}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {u.role || "user"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {u.is_active ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        onClick={() => startEdit(u)}
                      >
                        Edit
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
          {editingUserId ? "Edit User" : "Add User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="username"
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="user@example.com"
          />
          {!editingUserId && (
            <InputField
              label="Temporary password"
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Initial login password"
              withToggle
            />
          )}
          <SelectField
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </SelectField>
          <div className="flex items-center gap-2">
            <input
              id="user-active"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label
              htmlFor="user-active"
              className="text-xs font-medium text-slate-700"
            >
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving
                ? "Saving…"
                : editingUserId
                  ? "Update user"
                  : "Create user"}
            </PrimaryButton>
            {editingUserId && (
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsersList;

