import { request } from "./httpClient";

export function listEmployees(token) {
  return request("/employees/", {}, token);
}

export function createEmployee(data, token) {
  return request("/employees/", { method: "POST", body: data }, token);
}

export function deleteEmployee(id, token) {
  return request(`/employees/${id}`, { method: "DELETE" }, token);
}

