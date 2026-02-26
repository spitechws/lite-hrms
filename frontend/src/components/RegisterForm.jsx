import React, { useState } from "react";

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
    <form onSubmit={handleSubmit} className="form">
      <label className="field">
        <span>Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose username"
        />
      </label>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose password"
        />
      </label>
      <button type="submit" className="btn-primary">
        Register
      </button>
    </form>
  );
}

export default RegisterForm;

