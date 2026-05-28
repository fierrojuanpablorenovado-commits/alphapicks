"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav style={{ background: "#0d1421", borderBottom: "1px solid #1e2d45" }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/estrategias" className="flex items-center gap-2">
          <div style={{ background: "#f97316", borderRadius: 8 }} className="w-7 h-7 flex items-center justify-center">
            <span className="text-white font-bold text-sm">α</span>
          </div>
          <span className="font-bold text-white text-lg">AlphaPicks</span>
          <span style={{ background: "#1a2235", color: "#f97316", border: "1px solid #7c2d12", fontSize: 10 }}
            className="px-2 py-0.5 rounded-full font-semibold">IA</span>
        </Link>

        <div className="flex items-center gap-1">
          {[
            { href: "/estrategias", label: "Estrategias" },
            { href: "/mercado",     label: "Mercado Live" },
            { href: "/metodologia", label: "Metodología" },
            { href: "/pricing",     label: "Planes" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                path.startsWith(href)
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pricing" style={{ background: "#f97316" }}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
