"use client";
import { useState, type FormEvent } from "react";
import { api, HttpError } from "@/lib/client";
import type { CompareResult } from "@/lib/types";
import { Empty, ErrorMsg, Loading } from "@/components/Status";
import LineChart from "@/components/LineChart";

export default function ComparePage() {
  const [input, setInput] = useState("Maria, Ana");
  const [data, setData] = useState<CompareResult | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "empty" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    const names = input.split(/[,\s]+/).filter(Boolean).join(",");
    try {
      setData(await api<CompareResult>(`/api/names/compare?names=${encodeURIComponent(names)}`));
      setState("ok");
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) setState("empty");
      else { setError(err instanceof Error ? err.message : "Erro."); setState("error"); }
    }
  }

  return (
    <>
      <h1>Comparar nomes</h1>
      <form className="card row" onSubmit={submit}>
        <label>Nomes (2 a 4, separados por vírgula)
          <input value={input} onChange={(e) => setInput(e.target.value)} required />
        </label>
        <button disabled={state === "loading"}>Comparar</button>
      </form>
      {state === "loading" && <Loading />}
      {state === "error" && <ErrorMsg text={error} />}
      {state === "empty" && <Empty text="Nenhum registro encontrado para os nomes informados." />}
      {state === "ok" && data && (
        <section className="card">
          <LineChart decades={data.decades} series={data.names} />
          <div className="table-wrap">
            <table>
              <thead><tr><th>Década</th>{data.names.map((n) => <th key={n.name}>{n.name}</th>)}</tr></thead>
              <tbody>
                {data.decades.map((d, i) => <tr key={d}><td>{d}</td>{data.names.map((n) => <td key={n.name}>{n.values[i].toLocaleString("pt-BR")}</td>)}</tr>)}
                <tr><th>Total</th>{data.names.map((n) => <th key={n.name}>{n.total.toLocaleString("pt-BR")}</th>)}</tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
