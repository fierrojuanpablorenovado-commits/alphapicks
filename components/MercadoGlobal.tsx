'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Indice  = { symbol: string; flag: string; region: string; e: string; u: number; c: number; ytdp: number; f: string }
type Quote   = { symbol: string; fmpSymbol: string; price: number; change: number; changeAbs: number; volume: number; timestamp: string }
type Noticia = { titulo: string; subtitulo?: string; enlace?: string; fecha?: string; emisora?: string }
type Divisas = { USDMXN?: { u: number; c: number }; EURMXN?: { u: number; c: number }; EURUSD?: { u: number; c: number }; GBPMXN?: { u: number; c: number } }
type MercadoData = {
  updatedAt: string
  indices:  Indice[]
  noticias: Noticia[]
  divisas:  Divisas
  ipc: { quotes: Quote[]; gainers: Quote[]; losers: Quote[]; stats: { total: number; up: number; down: number; avg: number } }
}

export default function MercadoGlobal() {
  const [data, setData]       = useState<MercadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastAt, setLastAt]   = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/mercado-global', { cache: 'no-store' })
      if (r.ok) { setData(await r.json()); setLastAt(new Date()) }
    } catch { /* silently fail */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { const t = setInterval(fetch_, 60_000); return () => clearInterval(t) }, [fetch_])

  if (loading) return <SkeletonLoader />
  if (!data)   return <div style={{ padding: 48, textAlign: "center", color: "#334155" }}>Error cargando datos</div>

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')
  const ipcUp     = (ipcIndice?.c ?? 0) >= 0

  return (
    <div className="fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Fila 1: IPC Hero + Divisas + Top moves ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* IPC Card */}
        <div
          className="glass-card"
          style={{
            padding: "20px 22px",
            boxShadow: ipcUp ? "0 0 32px rgba(16,185,129,0.06)" : "0 0 32px rgba(239,68,68,0.06)",
            borderColor: ipcUp ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                IPC · Bolsa Mexicana
              </span>
            </div>
            <span style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
              background: ipcUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              color: ipcUp ? "#10B981" : "#EF4444",
              border: `1px solid ${ipcUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              {ipcUp ? "ALZA" : "BAJA"}
            </span>
          </div>
          {ipcIndice ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <span className="num" style={{ fontSize: 26, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em" }}>
                  {ipcIndice.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                </span>
                <span className="num" style={{ fontSize: 14, fontWeight: 700, color: ipcUp ? "#10B981" : "#EF4444" }}>
                  {ipcUp ? "+" : ""}{ipcIndice.c.toFixed(2)}%
                </span>
              </div>
              <p className="num" style={{ fontSize: 11, color: "#334155", marginBottom: 16 }}>
                YTD <span style={{ color: ipcIndice.ytdp >= 0 ? "#10B981" : "#EF4444" }}>
                  {ipcIndice.ytdp >= 0 ? "+" : ""}{ipcIndice.ytdp.toFixed(2)}%
                </span>
              </p>
            </>
          ) : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { v: data.ipc.stats.up,   label: "Alzas",  col: "#10B981" },
              { v: data.ipc.stats.down, label: "Bajas",  col: "#EF4444" },
              { v: data.ipc.stats.total,label: "Total",  col: "#94A3B8" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div className="num" style={{ fontSize: 16, fontWeight: 700, color: s.col }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divisas Card */}
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
            Tipos de Cambio
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { pair: "USD / MXN", val: data.divisas?.USDMXN },
              { pair: "EUR / MXN", val: data.divisas?.EURMXN },
              { pair: "EUR / USD", val: data.divisas?.EURUSD },
              { pair: "GBP / MXN", val: data.divisas?.GBPMXN },
            ].map(fx => (
              <div key={fx.pair} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span className="num" style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.04em" }}>{fx.pair}</span>
                <div style={{ textAlign: "right" }}>
                  <span className="num" style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", display: "block" }}>
                    {fx.val?.u.toFixed(4) ?? "—"}
                  </span>
                  <span className="num" style={{ fontSize: 10, color: (fx.val?.c ?? 0) >= 0 ? "#10B981" : "#EF4444" }}>
                    {fx.val ? `${fx.val.c >= 0 ? "+" : ""}${fx.val.c.toFixed(2)}%` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gainers / Losers */}
        <div className="glass-card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
            Mayores Movimientos
          </p>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 10, color: "#10B981", fontWeight: 600, marginBottom: 6, letterSpacing: "0.04em" }}>ALZAS</p>
            {data.ipc.gainers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="up" />)}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "10px 0" }} />
          <div>
            <p style={{ fontSize: 10, color: "#EF4444", fontWeight: 600, marginBottom: 6, letterSpacing: "0.04em" }}>BAJAS</p>
            {data.ipc.losers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="down" />)}
          </div>
        </div>
      </div>

      {/* ── Fila 2: Índices globales ── */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Índices Globales
          </p>
          {lastAt && (
            <span style={{ fontSize: 11, color: "#1E293B" }}>
              {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              <button onClick={fetch_} style={{ marginLeft: 6, color: "#334155", cursor: "pointer", background: "none", border: "none", fontSize: 13 }}>↻</button>
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {data.indices.map(idx => <IndiceCard key={idx.symbol} idx={idx} />)}
        </div>
      </section>

      {/* ── Fila 3: Mapa de calor ── */}
      <section>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Mapa de Calor — IPC
        </p>
        <HeatMap quotes={data.ipc.quotes} />
      </section>

      {/* ── Fila 4: YTD + Noticias ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            Rendimiento YTD
          </p>
          <YTDChart indices={data.indices} />
        </section>

        <section>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            Noticias Financieras
            <span style={{ color: "#1E293B", fontWeight: 400, marginLeft: 8 }}>
              {data.noticias.length} notas
            </span>
          </p>
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
      className="glass-card-sm"
      style={{
        padding: "12px 12px",
        cursor: "default",
        borderColor: up ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>{idx.flag}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: "0.04em" }}>{idx.symbol}</span>
      </div>
      <div className="num" style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
      </div>
      <div className="num" style={{ fontSize: 11, fontWeight: 700, color: up ? "#10B981" : "#EF4444" }}>
        {up ? "+" : ""}{idx.c.toFixed(2)}%
      </div>
      <div className="num" style={{ fontSize: 10, color: "#1E293B", marginTop: 3 }}>
        YTD {idx.ytdp >= 0 ? "+" : ""}{idx.ytdp.toFixed(1)}%
      </div>
    </div>
  )
}

function MoveRow({ q, dir }: { q: Quote; dir: "up" | "down" }) {
  const label = q.fmpSymbol.replace('.MX', '')
  const color = dir === "up" ? "#10B981" : "#EF4444"
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
      <span className="num" style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", width: 100 }}>{label}</span>
      <span className="num" style={{ fontSize: 11, color: "#475569" }}>{q.price.toFixed(2)}</span>
      <span className="num" style={{ fontSize: 12, fontWeight: 700, color }}>
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {active.map(q => {
        const abs = Math.abs(q.change)
        const intensity = Math.min(abs / 4, 1)
        const label = q.fmpSymbol.replace('.MX', '')
        const isUp = q.change > 0
        const isDown = q.change < 0

        const bg     = isUp   ? `rgba(16,185,129,${0.07 + intensity * 0.28})`
                      : isDown ? `rgba(239,68,68,${0.07 + intensity * 0.28})`
                      : "rgba(255,255,255,0.03)"
        const border = isUp   ? `rgba(16,185,129,${0.15 + intensity * 0.35})`
                      : isDown ? `rgba(239,68,68,${0.15 + intensity * 0.35})`
                      : "rgba(255,255,255,0.06)"
        const textCol = isUp ? "#10B981" : isDown ? "#EF4444" : "#94A3B8"
        const rank = active.indexOf(q)
        const w = rank < 4 ? 100 : rank < 10 ? 88 : 76

        return (
          <div
            key={q.symbol}
            style={{
              width: w, borderRadius: 10, padding: "10px 10px",
              background: bg, border: `1px solid ${border}`,
              cursor: "default",
              transition: "transform 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)" }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}%)`}
          >
            <div className="num" style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </div>
            <div className="num" style={{ fontSize: 11, fontWeight: 700, color: textCol }}>
              {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
            </div>
            <div className="num" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
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
    <div
      className="glass-card-sm"
      style={{ padding: "12px 14px", cursor: "default" }}
    >
      {n.emisora && (
        <span style={{
          display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          color: "#6366F1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 5, padding: "2px 6px", marginBottom: 6,
        }}>
          {n.emisora}
        </span>
      )}
      <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
    <div className="glass-card" style={{ height: 280, padding: "16px 4px 8px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={d} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#334155", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#334155", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#0A0F1A",
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
        {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
      </div>
      <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
    </div>
  )
}
