import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface InstrumentStats {
  id: number;
  symbol: string;
  userEmail: string;
  createdAt: string;
  totalTrades: number;
  totalPnl: number;
  winRate: number;
}

async function apiFetch<T>(
  path: string,
  userEmail: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-user-email": userEmail,
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return null as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

export const INSTRUMENTS_KEY = (email: string) => ["instruments", email];

export function useInstruments() {
  const { user } = useAuth();
  const email = user?.email ?? "";

  return useQuery<InstrumentStats[]>({
    queryKey: INSTRUMENTS_KEY(email),
    queryFn: () => apiFetch<InstrumentStats[]>("/api/instruments", email),
    enabled: !!email,
    staleTime: 30_000,
  });
}

export function useAddInstrument() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const email = user?.email ?? "";

  return useMutation<InstrumentStats, Error, string>({
    mutationFn: (symbol: string) =>
      apiFetch<InstrumentStats>("/api/instruments", email, {
        method: "POST",
        body: JSON.stringify({ symbol }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INSTRUMENTS_KEY(email) });
    },
  });
}

export function useRemoveInstrument() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const email = user?.email ?? "";

  return useMutation<void, Error, string>({
    mutationFn: (symbol: string) =>
      apiFetch<void>(`/api/instruments/${encodeURIComponent(symbol)}`, email, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INSTRUMENTS_KEY(email) });
    },
  });
}
