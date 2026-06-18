"use client";

/** Thin typed wrapper around fetch for our JSON API envelope. */
export class ClientApiError extends Error {
  constructor(public code: string, public status: number, public details?: unknown) {
    super(code);
    this.name = "ClientApiError";
  }
}

interface ApiEnvelope<T> {
  data?: T;
  error?: { code: string; details?: unknown };
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ClientApiError("network_error", 0);
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    body = null;
  }

  if (!res.ok || body?.error) {
    throw new ClientApiError(
      body?.error?.code ?? "request_failed",
      res.status,
      body?.error?.details
    );
  }

  return (body?.data ?? ({} as T)) as T;
}
