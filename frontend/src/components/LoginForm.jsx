import React, { useState } from "react";
import InputField from "./ui/InputField";
import PrimaryButton from "./ui/PrimaryButton";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Username"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username or email"
        autoComplete="username"
      />
      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        autoComplete="current-password"
        withToggle
      />
      <PrimaryButton type="submit">Login</PrimaryButton>
    </form>
  );
}

export default LoginForm;

