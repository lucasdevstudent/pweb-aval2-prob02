"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { DECADES, UFS } from "@/lib/ufs";
import type { RankingItem } from "@/lib/types";
import { Empty, ErrorMsg, Loading } from "@/components/Status";

export default function RankingPage() {
  const [uf, setUf] = useState("");
  const [decade, setDecade] = useState("");
  const [sex, setSex] = useState("");
  const [items, setItems] = useState<RankingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setItems(null); setError(null);
    const q = new URLSearchParams({ uf, decade, sex });
    api<{ items: RankingItem[] }>(`/api/names/ranking?${q}`, { signal: ctrl.signal })
      .then((d) => setItems(d.items))
      .catch((e: unknown) => { if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "Erro."); });
    return () => ctrl.abort();
  }, [uf, decade, sex]);

  return (
    <>
      <h1>Ranking de nomes do Brasil</h1>
      <div className="card row">
        <label>UF
          <select value={uf} onChange={(e) => setUf(e.target.value)}>
            <option value="">Brasil</option>{UFS.map((u) => <option key={u.uf}>{u.uf}</option>)}
          </select>
        </label>
        <label>Década
          <select value={decade} onChange={(e) => setDecade(e.target.value)}>
            <option value="">Todas</option>{DECADES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>Sexo
          <select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Todos</option><option value="M">Masculino</option><option value="F">Feminino</option>
          </select>
        </label>
      </div>
      {error && <ErrorMsg text={error} />}
      {!error && items === null && <Loading />}
      {items && items.length === 0 && <Empty text="Nenhum resultado para os filtros escolhidos." />}
      {items && items.length > 0 && (
        <div className="table-wrap">
          <table>
            <caption className="skip">Ranking de nomes</caption>
            <thead><tr><th>#</th><th>Nome</th><th>Frequência</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.name}>
                  <td>{i.rank}</td>
                  <td><Link href={`/names/${encodeURIComponent(i.name.toLowerCase())}`}>{i.name}</Link></td>
                  <td>{i.frequency.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
