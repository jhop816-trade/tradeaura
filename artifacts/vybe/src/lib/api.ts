import { useAuth } from "@clerk/react";

export function useApiClient() {
  const { getToken } = useAuth();

  async function apiFetch<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await getToken();
    const res = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error ?? `API error ${res.status}`);
    }
    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  }

  async function uploadFile(endpoint: string, file: File): Promise<{ url: string }> {
    const token = await getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error ?? `Upload error ${res.status}`);
    }
    return res.json();
  }

  return { apiFetch, uploadFile };
}
