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
    <nav className="sticky top-0 z-50">

      {/* ── Animated gradient top accent line ── */}
      <div className="top-accent-line" />

      {/* ── Nav body ── */}
      <div
        style={{
          background: "rgba(3,6,9,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/estrategias" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                boxShadow: "0 0 18px rgba(99,102,241,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span
                className="mono"
                style={{ color: "#fff", fontWeight: 800, fontSize: 17, lineHeight: 1, userSelect: "none" }}
              >α</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                AlphaPicks
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
                background: "rgba(99,102,241,0.12)", color: "#818CF8",
                border: "1px solid rgba(99,102,241,0.25)", letterSpacing: "0.1em",
              }}>IA</span>
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
                  style={{
                    position: "relative",
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#F1F5F9" : "#475569",
                    background: active ? "rgba(255,255,255,0.05)" : "transparent",
                    textDecoration: "none",
                    transition: "color 0.15s, background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    letterSpacing: active ? "-0.01em" : "0",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "#475569";
                  }}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: "absolute", bottom: 0,
                      left: 12, right: 12, height: 1, borderRadius: 99,
                      background: "linear-gradient(90deg, transparent, #6366F1, #8B5CF6, transparent)",
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/pricing"
            className="btn-brand hidden sm:inline-flex items-center"
            style={{ textDecoration: "none", fontSize: 12, padding: "7px 18px" }}
          >
            Comenzar gratis →
          </Link>

        </div>
      </div>
    </nav>
  );
}
