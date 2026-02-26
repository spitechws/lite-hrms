import React from "react";

function PrimaryButton({ children, type = "button", disabled, size = "md" }) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg bg-sky-600 text-white font-medium shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60";
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses}`}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;

