"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

type NavItem = { href: string; label: string; emoji: string; badge?: string }
type NavSection = { title: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    title: "Principal",
    items: [
      { href: "/estrategias", label: "Inicio",       emoji: "🏠" },
      { href: "/mercado",     label: "Mercado",      emoji: "📊" },
      { href: "/cartera",     label: "Mi cartera",   emoji: "💼" },
      { href: "/ideas",       label: "Ideas",        emoji: "💡", badge: "NUEVO" },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      { href: "/alphaai",     label: "AlphaAI",      emoji: "🤖", badge: "BETA" },
      { href: "/explorador",  label: "Explorador",   emoji: "🔍" },
      { href: "/screener",    label: "Screener",     emoji: "🎯" },
    ],
  },
  {
    title: "Recursos",
    items: [
      { href: "/metodologia", label: "Metodología",  emoji: "📚" },
      { href: "/pricing",     label: "Planes",       emoji: "💎" },
    ],
  },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() || "/"
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="sidebar sidebar-scroll"
        style={{
          width: collapsed ? 64 : 232,
          minWidth: collapsed ? 64 : 232,
          height: "100vh",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "width 0.2s ease, min-width 0.2s ease",
          flexShrink: 0,
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "18px 14px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/estrategias" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              boxShadow: "0 0 14px rgba(99,102,241,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="mono" style={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>α</span>
            </div>
            {!collapsed && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>AlphaPicks</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4,
                  background: "rgba(99,102,241,0.18)", color: "#A5B4FC",
                  border: "1px solid rgba(99,102,241,0.3)", letterSpacing: "0.1em",
                }}>IA</span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, padding: 4 }}
              title="Colapsar"
            >‹</button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 14, padding: 6, marginLeft: 18 }}
            title="Expandir"
          >›</button>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "4px 10px 14px" }}>
          {NAV.map(section => (
            <div key={section.title} style={{ marginBottom: 4 }}>
              {!collapsed && <div className="sidebar-section-title">{section.title}</div>}
              {section.items.map(item => {
                const active = path.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-item ${active ? "active" : ""}`}
                    title={collapsed ? item.label : undefined}
                    style={{ justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "8px 12px" }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1, filter: active ? "none" : "grayscale(0.3)" }}>{item.emoji}</span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span style={{
                            fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
                            padding: "2px 5px", borderRadius: 4,
                            background: item.badge === "NUEVO"
                              ? "linear-gradient(135deg, #10B981, #34D399)"
                              : "linear-gradient(135deg, #F59E0B, #FBBF24)",
                            color: "#fff",
                          }}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom plan card */}
        {!collapsed && (
          <div style={{ padding: "12px 14px 18px" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 12,
              padding: "14px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#A5B4FC", letterSpacing: "0.08em" }}>PLAN GRATIS</span>
              </div>
              <p style={{ fontSize: 11, color: "#CBD5E1", lineHeight: 1.45, marginBottom: 10 }}>
                Desbloquea AlphaAI, portafolios premium y screener avanzado.
              </p>
              <Link href="/pricing" className="btn-brand" style={{ display: "block", textAlign: "center", padding: "7px 12px", fontSize: 11, textDecoration: "none" }}>
                Upgrade a Pro →
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top accent line */}
        <div className="top-accent-line" />

        {/* Top bar */}
        <header
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 28px",
            background: "#FFFFFF",
            borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0, zIndex: 20,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 480 }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "var(--text-5)", pointerEvents: "none",
            }}>🔍</span>
            <input
              className="search-input"
              placeholder="Buscar emisora, ETF, idea o portafolio..."
            />
            <span style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              fontSize: 10, color: "var(--text-5)", background: "var(--bg-3)",
              padding: "2px 7px", borderRadius: 5, fontWeight: 600, letterSpacing: "0.04em",
              pointerEvents: "none",
            }}>⌘ K</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Live market badge */}
          <div className="trust-pill" style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#047857" }}>
            <div className="live-dot" />
            BMV abierto
          </div>

          {/* Notifications */}
          <button
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}
            title="Notificaciones"
          >
            🔔
            <span style={{
              position: "absolute", top: 5, right: 5,
              width: 7, height: 7, borderRadius: "50%",
              background: "#EF4444", border: "2px solid #fff",
            }} />
          </button>

          {/* User */}
          <button
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 10, cursor: "pointer",
            }}
            title="Cuenta"
          >
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 11,
            }}>JP</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>JP</span>
            <span style={{ fontSize: 9, color: "var(--text-5)" }}>▾</span>
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "hidden" }}>{children}</main>
      </div>
    </div>
  )
}
