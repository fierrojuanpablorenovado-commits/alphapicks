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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BMVTickerBanner />
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
