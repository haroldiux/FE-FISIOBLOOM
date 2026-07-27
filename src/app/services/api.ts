// En desarrollo usa el host local; en producción apunta al subdominio del backend en HTTPS.
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? `http://${window.location.hostname}:5000/api`
    : "https://api.fisio.claure.pro/api");



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

    // Si el pedido llevaba un token y el servidor lo rechazó (vencido o
    // inválido), antes cada pantalla mostraba su propio error suelto y la
    // app quedaba "viva" pero rota — el usuario veía el menú y el header
    // como si siguiera logueado, sin ninguna forma clara de arreglarlo salvo
    // recargar a mano. Ahora se cierra la sesión sola y se vuelve al login,
    // con un aviso explicando por qué.
    if (response.status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("tenantId");
      localStorage.removeItem("branchId");
      sessionStorage.setItem("bloomskin_session_expired", "1");
      window.location.reload();
      // No se resuelve ni se rechaza: la recarga ya está en curso y no tiene
      // sentido que el código que llamó siga ejecutando con datos rotos.
      return new Promise<T>(() => {});
    }

    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.response = response;
    throw error;
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
  patch: <T>(path: string, body: any, options?: RequestOptions) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
