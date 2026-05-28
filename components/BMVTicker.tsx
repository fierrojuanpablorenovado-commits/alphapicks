'use client'

import { useEffect, useState, useCallback } from 'react'

type Quote = {
  symbol: string
  fmpSymbol: string
  price: number
  change: number
  changeAbs: number
  volume: number
  timestamp: string
}
type MarketStats = {
  totalActive: number
  totalGainers: number
  totalLosers: number
  avgChange: number
  topGainer: Quote | null
  topLoser: Quote | null
}
type BMVData = {
  updatedAt: string
  quotes: Quote[]
  marketStats: MarketStats
  divisas?: { USDMXN?: { u: number; c: number }; EURMXN?: { u: number; c: number } }
}

// ─── Ticker Banner Premium ─────────────────────────────────────────────────────
export function BMVTickerBanner() {
  const [data, setData] = useState<BMVData | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/bmv', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 60_000)
    return () => clearInterval(t)
  }, [fetchData])

  if (!data?.quotes?.length) {
    return (
      <div style={{
        height: 36,
        background: "rgba(4,8,15,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }} />
    )
  }

  const active = data.quotes.filter(q => {
    return (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24
  })
  const usdmxn = data.divisas?.USDMXN
  const duration = Math.max(active.length * 3.5, 50)

  return (
    <div
      style={{
        height: 36,
        background: "rgba(4,8,15,0.98)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* USD/MXN pinned left */}
      {usdmxn && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            height: "100%",
            background: "rgba(8,13,24,0.9)",
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.05em" }}>
            USD/MXN
          </span>
          <span style={{ fontSize: 12, color: "#F1F5F9", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>
            {usdmxn.u.toFixed(4)}
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono',monospace",
            fontWeight: 500,
            color: usdmxn.c >= 0 ? "#10B981" : "#EF4444",
          }}>
            {usdmxn.c >= 0 ? "+" : ""}{usdmxn.c.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Fade edges */}
      <div style={{
        position: "absolute", left: usdmxn ? 120 : 0, top: 0, bottom: 0, width: 32,
        background: "linear-gradient(90deg, rgba(4,8,15,0.9), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
        background: "linear-gradient(270deg, rgba(4,8,15,0.9), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          className="ticker-track"
          style={{ "--ticker-duration": `${duration}s` } as React.CSSProperties}
        >
          {[...active, ...active].map((q, i) => {
            const up = q.change >= 0
            const label = q.fmpSymbol.replace('.MX', '').replace('*', '')
            return (
              <span
                key={`${q.symbol}-${i}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 20px",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 600, color: "#94A3B8",
                  fontFamily: "'Inter',sans-serif", letterSpacing: "0.04em",
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: 11, color: "#F1F5F9",
                  fontFamily: "'JetBrains Mono',monospace", fontWeight: 500,
                }}>
                  {q.price.toFixed(2)}
                </span>
                <span style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono',monospace",
                  fontWeight: 600,
                  color: up ? "#10B981" : "#EF4444",
                }}>
                  {up ? "▲" : "▼"} {Math.abs(q.change).toFixed(2)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Market Panel Premium ──────────────────────────────────────────────────────
export function BMVMarketPanel() {
  const [data, setData] = useState<BMVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'volume'>('change')
  const [sortDir, setSortDir] = useState<1 | -1>(-1)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/bmv', { cache: 'no-store' })
      if (res.ok) { setData(await res.json()); setLastRefresh(new Date()) }
    } catch { /* silently fail */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 60_000); return () => clearInterval(t) }, [fetchData])

  if (loading) return <SkeletonPanel />
  if (!data) return null

  const { marketStats, divisas, quotes } = data
  const usdmxn = divisas?.USDMXN

  const active = quotes
    .filter(q => (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24)
    .sort((a, b) => {
      const va = sortBy === 'change' ? a.change : sortBy === 'price' ? a.price : a.volume
      const vb = sortBy === 'change' ? b.change : sortBy === 'price' ? b.price : b.volume
      return (va - vb) * sortDir
    })

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortBy(col); setSortDir(-1) }
  }

  return (
    <div className="space-y-5 fade-in-up">
      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          label="Emisoras activas"
          value={String(marketStats.totalActive)}
          sub={`${marketStats.totalGainers} alzas · ${marketStats.totalLosers} bajas`}
          variant="neutral"
        />
        <StatTile
          label="Tendencia IPC"
          value={`${marketStats.avgChange >= 0 ? "+" : ""}${marketStats.avgChange.toFixed(2)}%`}
          sub="Promedio del día"
          variant={marketStats.avgChange >= 0 ? "up" : "down"}
        />
        {marketStats.topGainer && (
          <StatTile
            label="Mayor alza"
            value={`+${marketStats.topGainer.change.toFixed(2)}%`}
            sub={marketStats.topGainer.fmpSymbol.replace('.MX', '')}
            variant="up"
          />
        )}
        {usdmxn && (
          <StatTile
            label="USD / MXN"
            value={usdmxn.u.toFixed(4)}
            sub={`${usdmxn.c >= 0 ? "+" : ""}${usdmxn.c.toFixed(2)}% hoy`}
            variant={usdmxn.c >= 0 ? "up" : "down"}
          />
        )}
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Th label="Emisora" />
              <Th label="Precio" align="right" onClick={() => handleSort('price')} active={sortBy === 'price'} dir={sortDir} />
              <Th label="Cambio %" align="right" onClick={() => handleSort('change')} active={sortBy === 'change'} dir={sortDir} />
              <Th label="Cambio $" align="right" cls="hidden sm:table-cell" />
              <Th label="Volumen" align="right" onClick={() => handleSort('volume')} active={sortBy === 'volume'} dir={sortDir} cls="hidden md:table-cell" />
            </tr>
          </thead>
          <tbody>
            {active.map((q, i) => {
              const up = q.change >= 0
              const label = q.fmpSymbol.replace('.MX', '')
              return (
                <tr
                  key={q.symbol}
                  className="data-row"
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#E2E8F0",
                      letterSpacing: "0.03em",
                    }}>{label}</span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <span className="num" style={{ fontSize: 12, color: "#CBD5E1" }}>
                      {q.price.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: up ? "#10B981" : "#EF4444",
                    }}>
                      <span style={{ fontSize: 8 }}>{up ? "▲" : "▼"}</span>
                      {Math.abs(q.change).toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }} className="hidden sm:table-cell">
                    <span className="num" style={{ fontSize: 11, color: up ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)" }}>
                      {up ? "+" : ""}{q.changeAbs.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }} className="hidden md:table-cell">
                    <span className="num" style={{ fontSize: 11, color: "#475569" }}>
                      {fmtVol(q.volume)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {lastRefresh && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#1E293B" }}>
            Fuente: DataBursatil — BMV
          </span>
          <button onClick={fetchData} style={{ fontSize: 11, color: "#475569", cursor: "pointer", background: "none", border: "none" }}>
            ↻ {lastRefresh.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatTile({ label, value, sub, variant }: {
  label: string; value: string; sub: string
  variant: 'up' | 'down' | 'neutral'
}) {
  const accent = variant === 'up' ? '#10B981' : variant === 'down' ? '#EF4444' : '#94A3B8'
  const glow   = variant === 'up' ? 'rgba(16,185,129,0.06)' : variant === 'down' ? 'rgba(239,68,68,0.06)' : 'transparent'
  return (
    <div
      className="glass-card"
      style={{ padding: "14px 16px", background: `rgba(10,16,30,0.9)`, boxShadow: `0 0 24px ${glow}` }}
    >
      <p style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p className="num" style={{ fontSize: 18, fontWeight: 700, color: accent, lineHeight: 1.1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>{sub}</p>
    </div>
  )
}

function Th({ label, align, onClick, active, dir, cls }: {
  label: string; align?: "right" | "left"; onClick?: () => void; active?: boolean; dir?: number; cls?: string
}) {
  return (
    <th
      className={cls}
      onClick={onClick}
      style={{
        padding: "10px 16px",
        textAlign: align ?? "left",
        fontSize: 11,
        fontWeight: 500,
        color: active ? "#F1F5F9" : "#334155",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}{active && (dir === 1 ? " ↑" : " ↓")}
    </th>
  )
}

function SkeletonPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
      </div>
      <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
    </div>
  )
}

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}
