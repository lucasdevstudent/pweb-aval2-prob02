import { NextRequest, NextResponse } from "next/server";
import { ApiError, capitalize, fail, validName } from "@/lib/http";
import { apiKey, fetchSeries } from "@/lib/ibge";
import type { CompareResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const raw = (req.nextUrl.searchParams.get("names") ?? "").split(",").filter((s) => s.trim() !== "");
    const names = [...new Map(raw.map((n) => [apiKey(validName(n)), validName(n)])).values()];
    if (names.length < 2 || names.length > 4)
      throw new ApiError(400, "Informe de 2 a 4 nomes distintos, separados por vírgula (parâmetro names).");
    const map = await fetchSeries(names);
    const decades = [...new Set([...map.values()].flat().filter((p) => p.count > 0).map((p) => p.decade))].sort((a, b) => a - b);
    if (decades.length === 0) throw new ApiError(404, "Nenhum registro encontrado para os nomes informados.");
    const result: CompareResult = {
      decades,
      names: names.map((n) => {
        const pts = map.get(apiKey(n)) ?? [];
        const values = decades.map((d) => pts.find((p) => p.decade === d)?.count ?? 0);
        return { name: capitalize(n), total: values.reduce((a, b) => a + b, 0), values };
      }),
    };
    return NextResponse.json(result, { status: 200 });
  } catch (e) { return fail(e); }
}
