"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, HttpError } from "@/lib/client";
import type { NameDetail } from "@/lib/types";
import { Empty, ErrorMsg, Loading } from "@/components/Status";
import LineChart from "@/components/LineChart";
import SaveNameForm from "@/components/SaveNameForm";

export default function NameDetailPage() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<NameDetail | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    api<NameDetail>(`/api/names/${encodeURIComponent(name)}`, { signal: ctrl.signal })
      .then((d) => { setData(d); setState("ok"); })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return;
        if (e instanceof HttpError && e.status === 404) setState("empty");
        else { setError(e instanceof Error ? e.message : "Erro."); setState("error"); }
      });
    return () => ctrl.abort();
  }, [name]);

  return (
    <>
      <p><Link href="/">← Voltar ao ranking</Link></p>
      <h1>{decodeURIComponent(name)}</h1>
      {state === "loading" && <Loading />}
      {state === "empty" && <Empty text="Este nome não possui registros na base do IBGE (nomes pouco frequentes não constam)." />}
      {state === "error" && <ErrorMsg text={error} />}
      {state === "ok" && data && (
        <>
          <div className="stats card">
            <div><strong>{data.total.toLocaleString("pt-BR")}</strong>total de registros</div>
            <div><strong>{data.peakDecade}</strong>década de pico</div>
            <div><strong>{data.changePercent === null ? "—" : `${data.changePercent > 0 ? "+" : ""}${data.changePercent.toLocaleString("pt-BR")}%`}</strong>variação {data.firstDecade}–{data.lastDecade}</div>
          </div>
          <section className="card">
            <h2>Série histórica</h2>
            <LineChart decades={data.series.map((s) => s.decade)} series={[{ name: data.name, values: data.series.map((s) => s.count) }]} />
            <div className="table-wrap">
              <table>
                <thead><tr><th>Década</th><th>Registros</th></tr></thead>
                <tbody>{data.series.map((s) => <tr key={s.decade}><td>{s.decade}</td><td>{s.count.toLocaleString("pt-BR")}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <SaveNameForm name={data.name} />
        </>
      )}
    </>
  );
}
