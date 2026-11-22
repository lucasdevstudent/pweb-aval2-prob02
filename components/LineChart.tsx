interface Props { decades: number[]; series: { name: string; values: number[] }[] }
const COLORS = ["#0b5cad", "#c2410c", "#15803d", "#7e22ce"];

export default function LineChart({ decades, series }: Props) {
  const W = 600, H = 260, L = 56, R = 12, T = 12, B = 32;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i: number) => L + (decades.length < 2 ? (W - L - R) / 2 : (i * (W - L - R)) / (decades.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfico de registros por década">
        <line x1={L} y1={y(0)} x2={W - R} y2={y(0)} stroke="#6b7480" />
        <line x1={L} y1={T} x2={L} y2={y(0)} stroke="#6b7480" />
        <text x={L - 6} y={T + 4} fontSize="11" textAnchor="end">{max.toLocaleString("pt-BR")}</text>
        <text x={L - 6} y={y(0)} fontSize="11" textAnchor="end">0</text>
        {decades.map((d, i) => <text key={d} x={x(i)} y={H - 10} fontSize="11" textAnchor="middle">{d}</text>)}
        {series.map((s, k) => (
          <g key={s.name} stroke={COLORS[k % 4]} fill={COLORS[k % 4]}>
            <polyline fill="none" strokeWidth="2.5" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5"><title>{`${s.name}, ${decades[i]}: ${v.toLocaleString("pt-BR")}`}</title></circle>)}
          </g>
        ))}
      </svg>
      <ul className="legend">
        {series.map((s, k) => <li key={s.name}><i style={{ background: COLORS[k % 4] }} />{s.name}</li>)}
      </ul>
    </>
  );
}
