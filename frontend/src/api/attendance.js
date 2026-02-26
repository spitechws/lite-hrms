import { request } from "./httpClient";

export function markAttendance(data, token) {
  return request("/attendance", { method: "POST", body: data }, token);
}

export function getAttendanceForEmployee(employeeId, token) {
  return request(`/attendance/${employeeId}`, {}, token);
}

