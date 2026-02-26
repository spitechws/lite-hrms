import React, { useEffect, useState } from "react";
import { listUsers } from "../api/auth";

function UsersList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    listUsers(token)
      .then(setUsers)
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="card">
      <h2>Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

export default UsersList;

