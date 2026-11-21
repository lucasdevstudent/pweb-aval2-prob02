import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}


export function fail(e: unknown): NextResponse {
  if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(e);
  return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
}

export function validName(raw: string): string {
  const n = raw.trim();
  if (!/^\p{L}+$/u.test(n) || n.length > 40)
    throw new ApiError(400, "Nome inválido: use apenas letras, sem espaços (máx. 40).");
  return n;
}

export const capitalize = (n: string) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const b: unknown = await req.json();
    if (b && typeof b === "object" && !Array.isArray(b)) return b as Record<string, unknown>;
  } catch { /* cai no erro abaixo */ }
  throw new ApiError(400, "Corpo da requisição deve ser um objeto JSON válido.");
}

export function parseRating(v: unknown): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5)
    throw new ApiError(400, "A avaliação (rating) deve ser um inteiro de 1 a 5.");
  return v;
}
export function parseNote(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string" || v.length > 500) throw new ApiError(400, "O comentário (note) deve ter até 500 caracteres.");
  return v;
}

