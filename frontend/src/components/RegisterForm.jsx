import React, { useState } from "react";
import InputField from "./ui/InputField";
import PrimaryButton from "./ui/PrimaryButton";

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    onRegister({ username, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Username"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose username"
        autoComplete="username"
      />
      <InputField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Choose password"
        autoComplete="new-password"
        withToggle
      />
      <PrimaryButton type="submit">Register</PrimaryButton>
    </form>
  );
}

export default RegisterForm;

