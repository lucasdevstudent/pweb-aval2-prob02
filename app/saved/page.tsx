"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { SavedName } from "@/lib/types";
import { Empty, ErrorMsg, Loading } from "@/components/Status";
import SaveNameForm from "@/components/SaveNameForm";

function Item({ item, onChange, onDelete }: { item: SavedName; onChange: (s: SavedName) => void; onDelete: (id: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(item.rating);
  const [note, setNote] = useState(item.note ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      onChange(await api<SavedName>(`/api/saved-names/${item.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, note }),
      }));
      setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Erro."); }
  }
  async function remove() {
    if (!confirm(`Remover "${item.name}"?`)) return;
    try { await api<void>(`/api/saved-names/${item.id}`, { method: "DELETE" }); onDelete(item.id); }
    catch (e) { setError(e instanceof Error ? e.message : "Erro."); }
  }

  return (
    <li className="card">
      <h2><Link href={`/names/${encodeURIComponent(item.name.toLowerCase())}`}>{item.name}</Link></h2>
      {editing ? (
        <div className="row">
          <label>Avaliação
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select>
          </label>
          <label>Comentário<textarea value={note} maxLength={500} rows={2} onChange={(e) => setNote(e.target.value)} /></label>
          <button onClick={save}>Salvar</button>
          <button className="secondary" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      ) : (
        <>
          <p>Avaliação: {item.rating}/5 — salvo em {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
          <p>{item.note ?? <em>Sem comentário.</em>}</p>
          <div className="row">
            <button className="secondary" onClick={() => setEditing(true)}>Editar</button>
            <button className="danger" onClick={remove}>Remover</button>
          </div>
        </>
      )}
      {error && <ErrorMsg text={error} />}
    </li>
  );
}

export default function SavedPage() {
  const [items, setItems] = useState<SavedName[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api<SavedName[]>("/api/saved-names").then(setItems).catch((e: unknown) => setError(e instanceof Error ? e.message : "Erro."));
  }, []);
  useEffect(load, [load]);

  return (
    <>
      <h1>Nomes salvos</h1>
      <SaveNameForm onSaved={load} />
      {error && <ErrorMsg text={error} />}
      {!error && items === null && <Loading />}
      {items && items.length === 0 && <Empty text="Você ainda não salvou nenhum nome." />}
      {items && items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((i) => (
            <Item key={i.id} item={i}
              onChange={(s) => setItems((l) => l && l.map((x) => (x.id === s.id ? s : x)))}
              onDelete={(id) => setItems((l) => l && l.filter((x) => x.id !== id))} />
          ))}
        </ul>
      )}
    </>
  );
}
