const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message || `API Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (body: { email: string; password: string; csrfToken: string }) =>
      request<{ user: { id: string; email: string; name: string | null; role: string }; expires: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    session: () => request<{ user: { id: string; email: string; name: string | null; role: string }; expires: string }>("/api/auth/session"),
    logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  },
  rules: {
    list: () => request<unknown[]>("/api/rules"),
    create: (body: unknown) => request<unknown>("/api/rules", { method: "POST", body: JSON.stringify(body) }),
    toggle: (id: string, active: boolean) => request<unknown>(`/api/rules/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ active }) }),
    remove: (id: string) => request<{ deleted: boolean }>(`/api/rules/${id}`, { method: "DELETE" }),
  },
  billing: {
    purchase: (body: { plan: string; gateway: string; idempotencyKey: string; csrfToken: string }) =>
      request<unknown>("/api/billing/purchase", { method: "POST", body: JSON.stringify(body) }),
    transactions: () => request<unknown[]>("/api/billing/transactions"),
  },
};
