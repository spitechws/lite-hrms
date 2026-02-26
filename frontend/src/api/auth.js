import { API_BASE_URL, request } from "./httpClient";

export async function register(data) {
  return request("/auth/register", { method: "POST", body: data });
}

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

export async function changePassword(token, data) {
  return request("/auth/change-password", { method: "POST", body: data }, token);
}

