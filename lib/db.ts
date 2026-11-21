import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Registros iniciais. Nomes existentes no IBGE; mistura de notas vazias/preenchidas.
const SEEDS: { name: string; rating: number; note: string | null }[] = [
  { name: "Maria", rating: 5, note: "O nome mais frequente do Brasil." },
  { name: "João", rating: 4, note: null },
  { name: "Ana", rating: 5, note: "Curto e atemporal." },
  { name: "Lucas", rating: 3, note: null },
  { name: "Beatriz", rating: 4, note: "Em alta nas últimas décadas." },
];

function open(): Database.Database {
  const file = path.join(process.cwd(), "data", "app.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file); // journal_mode padrão (DELETE); WAL não é ativado
  const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='saved_names'").get();
  if (!exists) {
    db.exec(`CREATE TABLE saved_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      note TEXT CHECK (note IS NULL OR length(note) <= 500),
      created_at TEXT NOT NULL
    )`);
    const ins = db.prepare("INSERT INTO saved_names (name, rating, note, created_at) VALUES (?, ?, ?, ?)");
    db.transaction(() => {
      for (const s of SEEDS) ins.run(s.name, s.rating, s.note, new Date().toISOString());
    })();
  }
  return db;
}

const g = globalThis as unknown as { __db?: Database.Database };
export const getDb = (): Database.Database => (g.__db ??= open());
