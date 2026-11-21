import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ApiError, fail, parseNote, parseRating, readJson } from "@/lib/http";
import type { SavedName } from "@/lib/types";

async function getId(ctx: { params: Promise<{ id: string }> }): Promise<number> {
  const raw = (await ctx.params).id;
  if (!/^\d+$/.test(raw)) throw new ApiError(400, "Identificador inválido.");
  return Number(raw);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const id = await getId(ctx);
    const b = await readJson(req);
    const extra = Object.keys(b).filter((k) => k !== "rating" && k !== "note");
    if (extra.length) throw new ApiError(400, `Campos não editáveis: ${extra.join(", ")}. Edite apenas rating e note.`);
    if (!("rating" in b) && !("note" in b)) throw new ApiError(400, "Informe rating e/ou note.");
    const db = getDb();
    const cur = db.prepare("SELECT id, name, rating, note, created_at FROM saved_names WHERE id = ?").get(id) as SavedName | undefined;
    if (!cur) throw new ApiError(404, "Nome salvo não encontrado.");
    const rating = "rating" in b ? parseRating(b.rating) : cur.rating;
    const note = "note" in b ? parseNote(b.note) : cur.note;
    db.prepare("UPDATE saved_names SET rating = ?, note = ? WHERE id = ?").run(rating, note, id);
    return NextResponse.json({ ...cur, rating, note }, { status: 200 });
  } catch (e) { return fail(e); }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const id = await getId(ctx);
    const info = getDb().prepare("DELETE FROM saved_names WHERE id = ?").run(id);
    if (info.changes === 0) throw new ApiError(404, "Nome salvo não encontrado.");
    return new Response(null, { status: 204 });
  } catch (e) { return fail(e); }
}
