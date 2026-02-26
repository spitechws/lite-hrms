import React from "react";

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  className = "",
  size = "md",
}) {
  const baseClasses =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-sm";

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${sizeClasses} ${className}`}
      >
        {children}
      </select>
    </div>
  );
}

export default SelectField;

