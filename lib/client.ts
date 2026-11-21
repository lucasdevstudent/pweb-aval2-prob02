export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  if (r.status === 204) return undefined as T;
  const d = (await r.json().catch(() => null)) as ({ error?: string } & Record<string, unknown>) | null;
  if (!r.ok) throw new HttpError(r.status, d?.error ?? "Erro inesperado.");
  return d as T;
}
