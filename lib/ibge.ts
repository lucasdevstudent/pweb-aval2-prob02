import { ApiError } from "./http";
import { UFS } from "./ufs";
import type { DecadePoint, RankingItem } from "./types";

const BASE = "https://servicodados.ibge.gov.br/api/v2/censos/nomes";

async function get<T>(path: string): Promise<T> {
  let r: Response;
  try {
    r = await fetch(BASE + path, {
      headers: { "User-Agent": "ExploradorNomesBR/1.0 (UESPI - Programacao Web)", Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(502, "Falha na comunicação com a API do IBGE.");
  }
  if (!r.ok) throw new ApiError(502, `A API do IBGE respondeu com status ${r.status}.`);
  try { return (await r.json()) as T; }
  catch { throw new ApiError(502, "Resposta inválida da API do IBGE."); }
}

/** A API do IBGE usa nomes em maiúsculas e sem acentos. */
export const apiKey = (n: string) => n.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();

/** "[1930,1940[" -> 1930; "1930[" (antes de 1930) -> 1920. */
export function periodToDecade(p: string): number | null {
  const m = p.match(/\d{4}/);
  if (!m) return null;
  const y = Number(m[0]);
  return p.startsWith("[") ? y : y - 10;
}

type RankingResponse = { res: { nome: string; frequencia: number; ranking: number }[] };
interface SeriesResponse { nome: string; res: { periodo: string; frequencia: number }[] }

export async function fetchRanking(uf?: string, decade?: number, sex?: string): Promise<RankingItem[]> {
  const q = new URLSearchParams();
  if (uf) q.set("localidade", String(UFS.find((u) => u.uf === uf)?.code));
  if (decade) q.set("decada", String(decade));
  if (sex) q.set("sexo", sex);
  const data = await get<{ res: RankingResponse["res"] }[]>(`/ranking?${q}`);
  return (data[0]?.res ?? []).map((r) => ({ name: r.nome, frequency: r.frequencia, rank: r.ranking }));
}

/** Retorna, para cada nome (chave apiKey), a série por década (somando períodos equivalentes). */
export async function fetchSeries(names: string[]): Promise<Map<string, DecadePoint[]>> {
  const keys = names.map(apiKey);
  const data = await get<SeriesResponse[]>(`/${encodeURIComponent(keys.join("|"))}`);
  const out = new Map<string, DecadePoint[]>();
  for (const k of keys) out.set(k, []);
  for (const item of data) {
    const acc = new Map<number, number>();
    for (const r of item.res) {
      const d = periodToDecade(r.periodo);
      if (d !== null) acc.set(d, (acc.get(d) ?? 0) + r.frequencia);
    }
    out.set(apiKey(item.nome), [...acc].map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade - b.decade));
  }
  return out;
}
