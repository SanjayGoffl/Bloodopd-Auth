/**
 * Lightweight API client with automatic token refresh.
 */

const BASE = "/api";

interface Tokens {
  access_token: string;
  refresh_token: string;
}

let tokens: Tokens | null = null;

export function setTokens(t: Tokens | null) {
  tokens = t;
  if (t) {
    localStorage.setItem("tetherx_tokens", JSON.stringify(t));
  } else {
    localStorage.removeItem("tetherx_tokens");
  }
}

export function loadTokens(): Tokens | null {
  if (tokens) return tokens;
  const raw = localStorage.getItem("tetherx_tokens");
  if (raw) {
    tokens = JSON.parse(raw);
    return tokens;
  }
  return null;
}

export function clearTokens() {
  tokens = null;
  localStorage.removeItem("tetherx_tokens");
}

async function refreshAccessToken(): Promise<boolean> {
  const t = loadTokens();
  if (!t?.refresh_token) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: t.refresh_token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const t = loadTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (t?.access_token) {
    headers["Authorization"] = `Bearer ${t.access_token}`;
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && t?.refresh_token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newT = loadTokens();
      if (newT) headers["Authorization"] = `Bearer ${newT.access_token}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// Auth-specific calls
export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function apiMfaVerify(email: string, code: string) {
  const res = await fetch(`${BASE}/auth/mfa-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "MFA verification failed");
  return data;
}
