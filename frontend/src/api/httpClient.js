const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

async function request(path, { method = "GET", headers = {}, body } = {}, token) {
  const url = `${API_BASE_URL}${path}`;
  const finalHeaders = {
    ...(body && !(body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body:
      body && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body || undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.detail) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : data.detail[0]?.msg || message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { API_BASE_URL, request };

