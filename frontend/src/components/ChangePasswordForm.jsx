import React, { useState } from "react";
import { changePassword } from "../api/auth";
import InputField from "./ui/InputField";
import PrimaryButton from "./ui/PrimaryButton";

function ChangePasswordForm({ token, onSuccess }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.new_password !== form.confirm_new_password) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(token, {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">
        Change password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField
          label="Current password"
          type="password"
          name="current_password"
          value={form.current_password}
          onChange={handleChange}
          autoComplete="current-password"
          withToggle
          size="sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <InputField
            label="New password"
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            autoComplete="new-password"
            withToggle
            size="sm"
          />
          <InputField
            label="Confirm new password"
            type="password"
            name="confirm_new_password"
            value={form.confirm_new_password}
            onChange={handleChange}
            autoComplete="new-password"
            withToggle
            size="sm"
          />
        </div>
        <PrimaryButton type="submit" disabled={saving} size="sm">
          {saving ? "Saving…" : "Update password"}
        </PrimaryButton>
      </form>
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

export default ChangePasswordForm;

