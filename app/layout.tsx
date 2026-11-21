import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";

export const metadata: Metadata = { title: "Explorador de Nomes do Brasil" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#main">Pular para o conteúdo</a>
        <Nav />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
