import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <nav aria-label="Principal">
        <Link href="/">Ranking</Link>
        <Link href="/compare">Comparar</Link>
        <Link href="/saved">Nomes salvos</Link>
      </nav>
    </header>
  );
}
