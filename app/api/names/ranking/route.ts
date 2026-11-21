import { NextRequest, NextResponse } from "next/server";
import { ApiError, fail } from "@/lib/http";
import { fetchRanking } from "@/lib/ibge";
import { UFS } from "@/lib/ufs";

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const uf = p.get("uf")?.toUpperCase() || undefined;
    const decadeRaw = p.get("decade") || undefined;
    const sex = p.get("sex")?.toUpperCase() || undefined;
    if (uf && !UFS.some((u) => u.uf === uf)) throw new ApiError(400, "UF inválida.");
    const decade = decadeRaw ? Number(decadeRaw) : undefined;
    if (decade !== undefined && !(Number.isInteger(decade) && decade >= 1930 && decade <= 2010 && decade % 10 === 0))
      throw new ApiError(400, "Década inválida: use 1930, 1940, ..., 2010.");
    if (sex && sex !== "M" && sex !== "F") throw new ApiError(400, "Sexo inválido: use M ou F.");
    const items = await fetchRanking(uf, decade, sex);
    return NextResponse.json({ filters: { uf, decade, sex }, items }, { status: 200 });
  } catch (e) { return fail(e); }
}
