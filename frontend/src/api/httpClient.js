const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api/v1";

async function request(path, { method = "GET", headers = {}, body } = {}, token) {
  const doFetch = async (maybeToken) => {
    const url = `${API_BASE_URL}${path}`;
    const finalHeaders = {
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    };

    if (maybeToken) {
      finalHeaders.Authorization = `Bearer ${maybeToken}`;
    }

    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body:
        body && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body || undefined,
    });

    return response;
  };

  let response = await doFetch(token);

  // If unauthorized, try refreshing the access token once using the stored refresh token.
  if (response.status === 401) {
    try {
      const savedRefresh = window.localStorage.getItem("hrms_refresh_token");
      if (savedRefresh) {
        const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: savedRefresh }),
        });

        if (refreshResp.ok) {
          const data = await refreshResp.json();
          // Persist new tokens and user info.
          if (data.access_token) {
            window.localStorage.setItem("hrms_token", data.access_token);
          }
          if (data.refresh_token) {
            window.localStorage.setItem("hrms_refresh_token", data.refresh_token);
          }
          if (data.user) {
            window.localStorage.setItem("hrms_user", JSON.stringify(data.user));
          }

          // Retry the original request with the new access token.
          response = await doFetch(data.access_token);
        } else {
          // Refresh failed, clear tokens.
          window.localStorage.removeItem("hrms_token");
          window.localStorage.removeItem("hrms_refresh_token");
          window.localStorage.removeItem("hrms_user");
        }
      }
    } catch {
      // Swallow refresh-related errors; fall through to normal error handling.
    }
  }

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

