"use client";
import { useAuth } from "./store";

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: { field: string; message: string }[] = []) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

/** Refresh-token cookie orqali yangi access token oladi. Bir vaqtda faqat bitta so'rov ketadi. */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" })
      .then(async (r) => {
        if (!r.ok) {
          useAuth.getState().set(null, null);
          return false;
        }
        const d = await r.json();
        useAuth.getState().set(d.access_token, d.user);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = useAuth.getState().token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const res = await fetch(path, { ...init, headers, body, credentials: "same-origin" });

  // Access token eskirgan bo'lsa — bir marta yangilab, so'rovni qaytaramiz
  if (res.status === 401 && retry && !path.startsWith("/api/auth/")) {
    if (await refreshSession()) return api<T>(path, init, false);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.detail || "Xatolik yuz berdi", data.errors || []);
  }
  return data as T;
}

export const qs = (params: Record<string, string | number | boolean | string[] | undefined | null>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};
