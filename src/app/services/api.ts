export const API_URL = "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  const branchId = localStorage.getItem("branchId");
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (tenantId) {
    headers.set("X-Tenant-ID", tenantId);
  }
  if (branchId) {
    headers.set("X-Branch-ID", branchId);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, config);

  if (!response.ok) {
    let errorMessage = "Ocurrió un error inesperado";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // No JSON payload
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: any, options?: RequestOptions) => request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
