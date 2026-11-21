import { NextRequest, NextResponse } from "next/server";
import { ApiError, capitalize, fail, validName } from "@/lib/http";
import { apiKey, fetchSeries } from "@/lib/ibge";
import type { NameDetail } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  try {
    const name = validName(decodeURIComponent((await ctx.params).name));
    const series = (await fetchSeries([name])).get(apiKey(name)) ?? [];
    const withData = series.filter((s) => s.count > 0);
    if (withData.length === 0) throw new ApiError(404, "Nenhum registro encontrado para este nome.");
    const total = withData.reduce((s, x) => s + x.count, 0);
    const peak = withData.reduce((a, b) => (b.count > a.count ? b : a));
    const first = withData[0], last = withData[withData.length - 1];
    const changePercent = withData.length > 1 ? Math.round(((last.count - first.count) / first.count) * 1000) / 10 : null;
    const body: NameDetail = {
      name: capitalize(name), series: withData, total, peakDecade: peak.decade,
      firstDecade: first.decade, lastDecade: last.decade, changePercent,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (e) { return fail(e); }
}
