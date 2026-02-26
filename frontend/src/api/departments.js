import { request } from "./httpClient";

export function listDepartments(token) {
  return request("/departments/", {}, token);
}

export function createDepartment(data, token) {
  return request("/departments/", { method: "POST", body: data }, token);
}

export function updateDepartment(id, data, token) {
  return request(`/departments/${id}`, { method: "PUT", body: data }, token);
}

export function deleteDepartment(id, token) {
  return request(`/departments/${id}`, { method: "DELETE" }, token);
}

