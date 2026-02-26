import React, { useState } from "react";

function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  disabled,
  className = "",
  withToggle = false,
  size = "md",
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && withToggle ? (show ? "text" : "password") : type;

  const baseInputClasses =
    "mt-1 w-full rounded-lg border border-slate-300 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-3 py-2 text-sm";

  return (
    <div className={isPassword && withToggle ? "relative" : ""}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={`${baseInputClasses} ${sizeClasses} ${
          isPassword && withToggle ? "pr-10" : ""
        } ${className}`}
      />
      {isPassword && withToggle && (
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className={`absolute inset-y-0 right-0 mr-3 ${
            label ? "mt-5" : "mt-1"
          } flex items-center text-slate-400 hover:text-slate-600`}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-4-9-8 0-1.13.27-2.2.76-3.17" />
              <path d="M6.1 6.1A9.77 9.77 0 0 1 12 4c5 0 9 4 9 8 0 1.61-.49 3.11-1.33 4.37" />
              <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
              <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default InputField;

