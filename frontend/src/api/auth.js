import { API_BASE_URL, request } from "./httpClient";

export async function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function getCurrentUser(token) {
  return request("/auth/me", {}, token);
}

export async function listUsers(token) {
  return request("/auth/users", {}, token);
}

export async function createUser(token, data) {
  return request("/auth/users", { method: "POST", body: data }, token);
}

export async function updateUser(token, id, data) {
  return request(`/auth/users/${id}`, { method: "PUT", body: data }, token);
}

export async function changePassword(token, data) {
  return request("/auth/change-password", { method: "POST", body: data }, token);
}

export async function refresh(refreshToken) {
  return request("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

