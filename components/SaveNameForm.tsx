"use client";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client";
import type { SavedName } from "@/lib/types";
import { ErrorMsg } from "./Status";

interface Props { name?: string; onSaved?: (s: SavedName) => void }

export default function SaveNameForm({ name, onSaved }: Props) {
  const [typed, setTyped] = useState("");
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setOk(false);
    try {
      const saved = await api<SavedName>("/api/saved-names", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name ?? typed, rating, note }),
      });
      setOk(true); setNote(""); setTyped("");
      onSaved?.(saved);
    } catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar."); }
    finally { setBusy(false); }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Salvar {name ?? "um nome"}</h2>
      <div className="row">
        {!name && <label>Nome<input value={typed} onChange={(e) => setTyped(e.target.value)} required maxLength={40} /></label>}
        <label>Avaliação
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Comentário (opcional)<textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} /></label>
        <button disabled={busy}>{busy ? "Salvando..." : "Salvar"}</button>
      </div>
      {error && <ErrorMsg text={error} />}
      {ok && <p role="status">Nome salvo com sucesso.</p>}
    </form>
  );
}
