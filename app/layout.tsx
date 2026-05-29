import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "AlphaPicks — Selección de acciones con IA",
  description: "Portafolios de acciones seleccionados por inteligencia artificial. Supera al mercado con estrategias backtestadas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
