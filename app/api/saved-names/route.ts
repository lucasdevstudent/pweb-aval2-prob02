import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ApiError, capitalize, fail, parseNote, parseRating, readJson, validName } from "@/lib/http";
import type { SavedName } from "@/lib/types";

export async function GET() {
  try {
    const rows = getDb().prepare("SELECT id, name, rating, note, created_at FROM saved_names ORDER BY created_at DESC, id DESC").all() as SavedName[];
    return NextResponse.json(rows, { status: 200 });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    const b = await readJson(req);
    if (typeof b.name !== "string") throw new ApiError(400, "O campo name é obrigatório.");
    const name = capitalize(validName(b.name));
    const rating = parseRating(b.rating);
    const note = parseNote(b.note);
    const db = getDb();
    if (db.prepare("SELECT 1 FROM saved_names WHERE name = ?").get(name))
      throw new ApiError(409, "Este nome já foi salvo.");
    const info = db.prepare("INSERT INTO saved_names (name, rating, note, created_at) VALUES (?, ?, ?, ?)")
      .run(name, rating, note, new Date().toISOString());
    const row = db.prepare("SELECT id, name, rating, note, created_at FROM saved_names WHERE id = ?").get(info.lastInsertRowid) as SavedName;
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return fail(e); }
}
