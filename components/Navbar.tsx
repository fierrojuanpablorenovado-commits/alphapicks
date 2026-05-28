"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/estrategias", label: "Estrategias" },
  { href: "/mercado",     label: "Mercado" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/pricing",     label: "Planes" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(4,8,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/estrategias" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              boxShadow: "0 0 12px rgba(99,102,241,0.4)",
            }}
          >
            <span className="text-white font-bold text-base leading-none select-none">α</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-bold text-[15px] tracking-tight"
              style={{ color: "#F1F5F9" }}
            >
              AlphaPicks
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "#818CF8",
                border: "1px solid rgba(99,102,241,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              IA
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{
                  color: active ? "#F1F5F9" : "#64748B",
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "#64748B";
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                    style={{ background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="btn-primary hidden sm:inline-flex items-center"
            style={{ textDecoration: "none" }}
          >
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
