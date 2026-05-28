import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { BMVTickerBanner } from "@/components/BMVTicker";

export const metadata: Metadata = {
  title: "AlphaPicks — Selección de acciones con IA",
  description: "Portafolios de acciones seleccionados por inteligencia artificial. Supera al mercado con estrategias backtestadas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <BMVTickerBanner />
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
