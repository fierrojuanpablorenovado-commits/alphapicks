'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Indice  = { symbol: string; flag: string; region: string; e: string; u: number; c: number; ytdp: number; f: string }
type Quote   = { symbol: string; fmpSymbol: string; price: number; change: number; changeAbs: number; volume: number; timestamp: string }
type Noticia = { titulo: string; subtitulo?: string; enlace?: string; fecha?: string; emisora?: string }
type Divisas = { USDMXN?: { u: number; c: number }; EURMXN?: { u: number; c: number }; EURUSD?: { u: number; c: number }; GBPMXN?: { u: number; c: number } }
type MercadoData = {
  updatedAt: string
  indices:   Indice[]
  noticias:  Noticia[]
  divisas:   Divisas
  ipc: { quotes: Quote[]; gainers: Quote[]; losers: Quote[]; stats: { total: number; up: number; down: number; avg: number } }
}

export default function MercadoGlobal() {
  const [data,    setData]    = useState<MercadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastAt,  setLastAt]  = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/mercado-global', { cache: 'no-store' })
      if (r.ok) { setData(await r.json()); setLastAt(new Date()) }
    } catch { /* silently fail */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { const t = setInterval(fetch_, 60_000); return () => clearInterval(t) }, [fetch_])

  if (loading) return <SkeletonLoader />
  if (!data)   return (
    <div style={{ padding: 64, textAlign: "center", color: "#334155", fontSize: 13 }}>
      Error cargando datos del mercado
    </div>
  )

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')
  const ipcUp     = (ipcIndice?.c ?? 0) >= 0
  const total     = data.ipc.stats.total || 1
  const upRatio   = (data.ipc.stats.up / total) * 100

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ══ IPC Hero ══════════════════════════════════════════════════════════ */}
      <div
        className="card-gradient-border"
        style={{
          padding: "28px 32px",
          boxShadow: ipcUp
            ? "0 8px 60px rgba(16,185,129,0.07)"
            : "0 8px 60px rgba(239,68,68,0.07)",
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: "0.06em" }}>EN VIVO</span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>IPC · Bolsa Mexicana de Valores</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {lastAt && (
              <span style={{ fontSize: 11, color: "#1E293B" }}>
                {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                <button
                  onClick={fetch_}
                  style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "#334155", fontSize: 13 }}
                >↻</button>
              </span>
            )}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, letterSpacing: "0.06em",
              background: ipcUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              color: ipcUp ? "#10B981" : "#EF4444",
              border: `1px solid ${ipcUp ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}>
              {ipcUp ? "↑ ALZA" : "↓ BAJA"}
            </span>
          </div>
        </div>

        {/* Price left / Sentiment right */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>

          {/* Giant price */}
          <div>
            {ipcIndice ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: "clamp(36px, 3.5vw, 54px)",
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "#F8FAFC",
                      textShadow: ipcUp
                        ? "0 0 40px rgba(16,185,129,0.4)"
                        : "0 0 40px rgba(239,68,68,0.4)",
                    }}
                  >
                    {ipcIndice.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
                      color: ipcUp ? "#10B981" : "#EF4444",
                    }}
                  >
                    {ipcUp ? "+" : ""}{ipcIndice.c.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase" }}>YTD</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: ipcIndice.ytdp >= 0 ? "#10B981" : "#EF4444" }}>
                      {ipcIndice.ytdp >= 0 ? "+" : ""}{ipcIndice.ytdp.toFixed(2)}%
                    </span>
                  </div>
                  {ipcIndice.f && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase" }}>Fecha</span>
                      <span className="mono" style={{ fontSize: 12, color: "#475569" }}>{ipcIndice.f}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="skeleton" style={{ height: 54, width: "80%", marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 18, width: "45%" }} />
              </>
            )}
          </div>

          {/* Sentiment bar + stats */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Sentimiento del mercado
                </span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: ipcUp ? "#10B981" : "#EF4444" }}>
                  {upRatio.toFixed(0)}% alcista
                </span>
              </div>
              <div className="sentiment-track">
                <div
                  className="sentiment-fill"
                  style={{
                    width: `${upRatio}%`,
                    background: ipcUp
                      ? "linear-gradient(90deg, #10B981, #34D399)"
                      : "linear-gradient(90deg, #EF4444, #F87171)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { v: data.ipc.stats.up,    label: "Alzas",  color: "#10B981", bg: "rgba(16,185,129,0.07)",  brd: "rgba(16,185,129,0.14)" },
                { v: data.ipc.stats.down,  label: "Bajas",  color: "#EF4444", bg: "rgba(239,68,68,0.07)",   brd: "rgba(239,68,68,0.14)" },
                { v: data.ipc.stats.total, label: "Total",  color: "#94A3B8", bg: "rgba(255,255,255,0.03)", brd: "rgba(255,255,255,0.06)" },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    background: s.bg, border: `1px solid ${s.brd}`,
                    borderRadius: 10, padding: "10px 12px", textAlign: "center",
                  }}
                >
                  <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                    {s.v}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Gainers/Losers + Divisas ══════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>

        {/* Gainers / Losers */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Mayores Movimientos
          </p>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 9, color: "#10B981", fontWeight: 700, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Alzas</p>
            {data.ipc.gainers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="up" />)}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "12px 0" }} />
          <div>
            <p style={{ fontSize: 9, color: "#EF4444", fontWeight: 700, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Bajas</p>
            {data.ipc.losers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="down" />)}
          </div>
        </div>

        {/* Divisas */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Tipos de Cambio
          </p>
          <div>
            {[
              { pair: "USD / MXN", val: data.divisas?.USDMXN, flag: "🇺🇸" },
              { pair: "EUR / MXN", val: data.divisas?.EURMXN, flag: "🇪🇺" },
              { pair: "EUR / USD", val: data.divisas?.EURUSD, flag: "🇪🇺" },
              { pair: "GBP / MXN", val: data.divisas?.GBPMXN, flag: "🇬🇧" },
            ].map((fx, i, arr) => {
              const fxUp = (fx.val?.c ?? 0) >= 0
              return (
                <div
                  key={fx.pair}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{fx.flag}</span>
                    <span className="mono" style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.04em" }}>{fx.pair}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", display: "block" }}>
                      {fx.val?.u.toFixed(4) ?? "—"}
                    </span>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 600, color: fxUp ? "#10B981" : "#EF4444" }}>
                      {fx.val ? `${fxUp ? "+" : ""}${fx.val.c.toFixed(2)}%` : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══ Índices Globales ══════════════════════════════════════════════════ */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Índices Globales
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
          {data.indices.map(idx => <IndiceCard key={idx.symbol} idx={idx} />)}
        </div>
      </section>

      {/* ══ Mapa de Calor ═════════════════════════════════════════════════════ */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Mapa de Calor — IPC
        </p>
        <div className="card" style={{ padding: "16px 18px" }}>
          <HeatMap quotes={data.ipc.quotes} />
        </div>
      </section>

      {/* ══ YTD Chart + Noticias ══════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Rendimiento YTD
          </p>
          <YTDChart indices={data.indices} />
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Noticias Financieras
            </p>
            <span style={{ fontSize: 11, color: "#1E293B" }}>{data.noticias.length} notas</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {data.noticias.slice(0, 6).map((n, i) => <NoticiaCard key={i} n={n} />)}
          </div>
        </section>
      </div>

    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function IndiceCard({ idx }: { idx: Indice }) {
  const up = idx.c >= 0
  return (
    <div
      className="card-sm"
      style={{
        padding: "12px",
        borderColor: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        cursor: "default",
        transition: "transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>{idx.flag}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>{idx.symbol}</span>
      </div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
      </div>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: up ? "#10B981" : "#EF4444", marginBottom: 2 }}>
        {up ? "+" : ""}{idx.c.toFixed(2)}%
      </div>
      <div className="mono" style={{ fontSize: 9, color: "#1E293B" }}>
        YTD {idx.ytdp >= 0 ? "+" : ""}{idx.ytdp.toFixed(1)}%
      </div>
    </div>
  )
}

function MoveRow({ q, dir }: { q: Quote; dir: "up" | "down" }) {
  const label = q.fmpSymbol.replace('.MX', '')
  const color = dir === "up" ? "#10B981" : "#EF4444"
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", minWidth: 90 }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: "#475569" }}>{q.price.toFixed(2)}</span>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color }}>
        {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
      </span>
    </div>
  )
}

function HeatMap({ quotes }: { quotes: Quote[] }) {
  const active = quotes
    .filter(q => (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24)
    .sort((a, b) => b.volume - a.volume)

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {active.map((q, i) => {
        const abs = Math.abs(q.change)
        const intensity = Math.min(abs / 4, 1)
        const label  = q.fmpSymbol.replace('.MX', '')
        const isUp   = q.change > 0
        const isDown = q.change < 0
        const bg      = isUp   ? `rgba(16,185,129,${0.07 + intensity * 0.28})`
                       : isDown ? `rgba(239,68,68,${0.07 + intensity * 0.28})`
                       : "rgba(255,255,255,0.03)"
        const border  = isUp   ? `rgba(16,185,129,${0.12 + intensity * 0.30})`
                       : isDown ? `rgba(239,68,68,${0.12 + intensity * 0.30})`
                       : "rgba(255,255,255,0.05)"
        const textCol = isUp ? "#10B981" : isDown ? "#EF4444" : "#94A3B8"
        const w = i < 4 ? 100 : i < 10 ? 90 : 78

        return (
          <div
            key={q.symbol}
            className="heat-tile"
            style={{ width: w, borderRadius: 10, padding: "10px", background: bg, border: `1px solid ${border}` }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}%)`}
          >
            <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </div>
            <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: textCol }}>
              {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
            </div>
            <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
              {q.price.toFixed(2)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <div className="card-sm" style={{ padding: "12px 14px", cursor: "default" }}>
      {n.emisora && (
        <span style={{
          display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          color: "#6366F1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: 5, padding: "2px 6px", marginBottom: 6, textTransform: "uppercase",
        }}>
          {n.emisora}
        </span>
      )}
      <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {n.titulo}
      </p>
      {n.fecha && (
        <p style={{ fontSize: 10, color: "#1E293B", marginTop: 6 }}>{n.fecha}</p>
      )}
    </div>
  )
}

function YTDChart({ indices }: { indices: Indice[] }) {
  const d = indices
    .filter(i => i.symbol !== 'VIX' && i.symbol !== 'FTSEBIVA')
    .sort((a, b) => b.ytdp - a.ytdp)
    .map(i => ({ name: i.symbol, ytd: i.ytdp }))

  return (
    <div className="card" style={{ height: 280, padding: "16px 4px 8px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={d} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#334155", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fill: "#334155", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#040814",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontSize: 11,
              fontFamily: "'Inter',sans-serif",
            }}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : String(v), 'YTD']}
          />
          <Bar dataKey="ytd" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {d.map(e => (
              <Cell key={e.name} fill={e.ytd >= 0 ? "#10B981" : "#EF4444"} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>
        {[0, 1].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
        {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
      </div>
      <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
    </div>
  )
}
