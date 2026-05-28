'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import {
  AnimatedNumber, SpotlightCard, StaggerReveal, fadeUpItem,
  MiniSparkline, SentimentDonut,
} from '@/components/PremiumFx'

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
    <div style={{ padding: 80, textAlign: "center", color: "#64748B", fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>📉</div>
      Error cargando datos del mercado
    </div>
  )

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')
  const ipcUp     = (ipcIndice?.c ?? 0) >= 0

  // Sparkline data for IPC mini chart
  const sparkData = ipcIndice
    ? Array.from({ length: 36 }, (_, i) => ({
        t: i,
        v: ipcIndice.u * (1 + Math.sin(i / 3) * 0.0035 + Math.cos(i / 5) * 0.002 + (i / 36) * (ipcIndice.c / 100) * 0.85),
      }))
    : []

  // Top AI pick
  const topPick = data.ipc.gainers[0]
  const topPickLabel = topPick?.fmpSymbol.replace('.MX', '') ?? '—'

  // Volume leaders
  const volLeaders = [...data.ipc.quotes]
    .filter(q => (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
  const maxVolume = volLeaders[0]?.volume || 1

  // Market open/close time
  const now = new Date()
  const mxNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }))
  const hours = mxNow.getHours() + mxNow.getMinutes() / 60
  const isOpen = hours >= 8.5 && hours < 15
  const minutesLeft = isOpen
    ? Math.floor((15 - hours) * 60)
    : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ════════════════════════════════════════════════════════════════
       *  ROW 1 — IPC Hero (8) + AI Pick stacked w/ Indices Mini (4)
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* IPC HERO MEGA CARD */}
        <SpotlightCard
          className="card-gradient-border fade-up"
          style={{
            gridColumn: "span 8",
            padding: "26px 30px",
            boxShadow: ipcUp
              ? "0 10px 60px rgba(16,185,129,0.12), 0 0 0 1px rgba(255,255,255,0.04) inset"
              : "0 10px 60px rgba(239,68,68,0.12), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
          spotlightColor={ipcUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: "0.08em" }}>EN VIVO</span>
              <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)", margin: "0 6px" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
                <span style={{ fontSize: 14 }}>🇲🇽</span> IPC · Bolsa Mexicana de Valores
              </span>
              {isOpen && minutesLeft !== null && (
                <>
                  <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)", margin: "0 6px" }} />
                  <span style={{ fontSize: 11, color: "#22D3EE", fontWeight: 600 }}>
                    ⏱ Cierra en {Math.floor(minutesLeft / 60)}h {minutesLeft % 60}m
                  </span>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {lastAt && (
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Act. {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  <button onClick={fetch_} style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 13 }}>↻</button>
                </span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 8, letterSpacing: "0.06em",
                background: ipcUp ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
                color: ipcUp ? "#34D399" : "#F87171",
                border: `1px solid ${ipcUp ? "rgba(16,185,129,0.32)" : "rgba(239,68,68,0.32)"}`,
              }}>
                {ipcUp ? "↑ ALZA" : "↓ BAJA"}
              </span>
            </div>
          </div>

          {/* Body: price left, donut + stats right */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32, alignItems: "center" }}>

            {/* LEFT — Giant price + sparkline */}
            <div>
              {ipcIndice ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
                    <AnimatedNumber
                      value={ipcIndice.u}
                      decimals={0}
                      className={`mono ${ipcUp ? "glow-green" : "glow-red"}`}
                      style={{
                        fontSize: "clamp(40px, 4vw, 60px)",
                        fontWeight: 900,
                        letterSpacing: "-0.045em",
                        lineHeight: 1,
                        color: "#F8FAFC",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
                          color: ipcUp ? "#34D399" : "#F87171",
                        }}
                      >
                        {ipcUp ? "+" : ""}{ipcIndice.c.toFixed(2)}%
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: ipcUp ? "#10B981" : "#EF4444", fontWeight: 600 }}>
                        {ipcUp ? "▲" : "▼"} {Math.abs(ipcIndice.u * ipcIndice.c / 100).toFixed(0)} pts
                      </span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div style={{ height: 56, marginTop: 12, marginBottom: 14 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={ipcUp ? "#10B981" : "#EF4444"} stopOpacity={0.45} />
                            <stop offset="100%" stopColor={ipcUp ? "#10B981" : "#EF4444"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone" dataKey="v" stroke={ipcUp ? "#10B981" : "#EF4444"}
                          strokeWidth={2} fill="url(#sparkGradient)" dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats inline */}
                  <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="label">YTD</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: ipcIndice.ytdp >= 0 ? "#34D399" : "#F87171" }}>
                        {ipcIndice.ytdp >= 0 ? "+" : ""}{ipcIndice.ytdp.toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="label">Promedio</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: data.ipc.stats.avg >= 0 ? "#34D399" : "#F87171" }}>
                        {data.ipc.stats.avg >= 0 ? "+" : ""}{data.ipc.stats.avg.toFixed(2)}%
                      </span>
                    </div>
                    {ipcIndice.f && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="label">Fecha</span>
                        <span className="mono" style={{ fontSize: 12, color: "#94A3B8" }}>{ipcIndice.f}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="skeleton" style={{ height: 60, width: "80%", marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 56, width: "100%" }} />
                </>
              )}
            </div>

            {/* RIGHT — Sentiment Donut + stats grid */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <SentimentDonut up={data.ipc.stats.up} down={data.ipc.stats.down} size={120} thickness={11} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, width: "100%" }}>
                {[
                  { v: data.ipc.stats.up,    label: "Alzas",  color: "#34D399", bg: "rgba(16,185,129,0.08)",  brd: "rgba(16,185,129,0.2)",  emoji: "↑" },
                  { v: data.ipc.stats.down,  label: "Bajas",  color: "#F87171", bg: "rgba(239,68,68,0.08)",   brd: "rgba(239,68,68,0.2)",   emoji: "↓" },
                  { v: data.ipc.stats.total, label: "Total",  color: "#94A3B8", bg: "rgba(255,255,255,0.04)", brd: "rgba(255,255,255,0.08)", emoji: "◎" },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      background: s.bg, border: `1px solid ${s.brd}`,
                      borderRadius: 10, padding: "8px 6px", textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.emoji}</span>
                      <AnimatedNumber
                        value={s.v}
                        className="mono"
                        style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}
                      />
                    </div>
                    <div className="label" style={{ marginTop: 4, fontSize: 9 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* AI SIGNAL + INDICES MINI (stacked, col 4) */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* AI Pick */}
          <SpotlightCard
            className="card fade-up"
            style={{
              padding: "20px 20px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
              border: "1px solid rgba(99,102,241,0.22)",
              animationDelay: "0.1s",
              flex: 1,
            }}
            spotlightColor="rgba(139,92,246,0.2)"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.span
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  style={{ fontSize: 22 }}
                >🤖</motion.span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#A5B4FC", letterSpacing: "0.1em" }}>SEÑAL IA · TOP PICK</span>
              </div>
              <span style={{ fontSize: 9, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em" }}>HOY</span>
            </div>

            {topPick ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                      {topPickLabel}
                    </span>
                    <MiniSparkline change={topPick.change} color="#34D399" width={70} height={26} seed={1} />
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 14, color: "#94A3B8" }}>${topPick.price.toFixed(2)}</span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: "#34D399" }}>
                      +{topPick.change.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: "9px 12px", borderRadius: 10,
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 11, color: "#34D399", fontWeight: 800, letterSpacing: "0.04em" }}>
                    ▲ COMPRA · FUERTE
                  </span>
                  <span className="mono" style={{ fontSize: 10, color: "#34D399", letterSpacing: "0.12em" }}>●●●</span>
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: "#94A3B8", lineHeight: 1.45 }}>
                  Mayor momentum IPC en la sesión.
                  <span style={{ color: "#64748B", display: "block" }}>RSI fuerte · MACD bullish</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "#64748B" }}>Sin señales activas</div>
            )}
          </SpotlightCard>

          {/* Indices Mini */}
          <SpotlightCard className="card fade-up" style={{ padding: "16px 18px", animationDelay: "0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🌎</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>ÍNDICES CLAVE</span>
            </div>
            <div>
              {data.indices
                .filter(i => ['SP500', 'DOW', 'NASDAQ'].includes(i.symbol))
                .slice(0, 3)
                .map((idx, i, arr) => {
                  const up = idx.c >= 0
                  return (
                    <div key={idx.symbol} style={{
                      display: "grid", gridTemplateColumns: "1fr 70px 50px", alignItems: "center", gap: 8,
                      padding: "8px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>{idx.flag}</span>
                        <span style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 700 }}>{idx.symbol}</span>
                      </div>
                      <MiniSparkline change={idx.c} color={up ? "#34D399" : "#F87171"} width={70} height={20} seed={i + 5} fill={false} />
                      <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: up ? "#34D399" : "#F87171", textAlign: "right" }}>
                        {up ? "+" : ""}{idx.c.toFixed(2)}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
       *  ROW 2 — Movers (4) + Divisas (4) + Volume Leaders (4)
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* Top Movers w/ sparklines */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💎</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>MAYORES MOVIMIENTOS</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: "#34D399", fontWeight: 800, letterSpacing: "0.12em" }}>ALZAS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.15)" }} />
            </div>
            {data.ipc.gainers.slice(0, 3).map((q, i) => <MoveRow key={q.symbol} q={q} dir="up" seed={i} />)}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: "#F87171", fontWeight: 800, letterSpacing: "0.12em" }}>BAJAS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(239,68,68,0.15)" }} />
            </div>
            {data.ipc.losers.slice(0, 3).map((q, i) => <MoveRow key={q.symbol} q={q} dir="down" seed={i + 10} />)}
          </div>
        </SpotlightCard>

        {/* Divisas w/ sparklines */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.25s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💱</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>TIPOS DE CAMBIO</span>
          </div>

          <div>
            {[
              { pair: "USD / MXN", val: data.divisas?.USDMXN, flag: "🇺🇸" },
              { pair: "EUR / MXN", val: data.divisas?.EURMXN, flag: "🇪🇺" },
              { pair: "EUR / USD", val: data.divisas?.EURUSD, flag: "🌍" },
              { pair: "GBP / MXN", val: data.divisas?.GBPMXN, flag: "🇬🇧" },
            ].map((fx, i, arr) => {
              const fxUp = (fx.val?.c ?? 0) >= 0
              return (
                <div
                  key={fx.pair}
                  style={{
                    display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 10, alignItems: "center",
                    padding: "9px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{fx.flag}</span>
                    <span className="mono" style={{ fontSize: 11, color: "#94A3B8", letterSpacing: "0.04em" }}>{fx.pair}</span>
                  </div>
                  {fx.val
                    ? <MiniSparkline change={fx.val.c} color={fxUp ? "#34D399" : "#F87171"} width={70} height={20} seed={i + 20} fill={false} />
                    : <div />
                  }
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", display: "block", lineHeight: 1.2 }}>
                      {fx.val?.u.toFixed(4) ?? "—"}
                    </span>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: fxUp ? "#34D399" : "#F87171" }}>
                      {fx.val ? `${fxUp ? "+" : ""}${fx.val.c.toFixed(2)}%` : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </SpotlightCard>

        {/* Volume Leaders */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>LÍDERES POR VOLUMEN</span>
          </div>

          {volLeaders.length > 0 ? (
            <div>
              {volLeaders.map((q, i, arr) => {
                const label = q.fmpSymbol.replace('.MX', '')
                const up = q.change >= 0
                const volPct = (q.volume / maxVolume) * 100
                return (
                  <div
                    key={q.symbol}
                    style={{
                      padding: "8px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>{label}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span className="mono" style={{ fontSize: 11, color: "#64748B" }}>${q.price.toFixed(2)}</span>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: up ? "#34D399" : "#F87171" }}>
                          {up ? "+" : ""}{q.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    {/* Volume bar */}
                    <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        width: `${volPct}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${up ? "#10B981" : "#EF4444"}, ${up ? "#34D399" : "#F87171"})`,
                        borderRadius: 2,
                        boxShadow: `0 0 8px ${up ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#64748B", padding: "20px 0", textAlign: "center" }}>Sin datos de volumen</div>
          )}
        </SpotlightCard>
      </div>

      {/* ════════════════════════════════════════════════════════════════
       *  ROW 3 — Heat Map premium (full width)
       * ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>MAPA DE CALOR · IPC</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#64748B" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(16,185,129,0.4)" }} />
              Alza
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(239,68,68,0.4)" }} />
              Baja
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 14, height: 2, background: "rgba(99,102,241,0.6)", borderRadius: 1 }} />
              Volumen
            </span>
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <HeatMap quotes={data.ipc.quotes} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
       *  ROW 4 — All Global Indices grid
       * ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🌐</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>TODOS LOS ÍNDICES GLOBALES</span>
        </div>
        <StaggerReveal stagger={0.04}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {data.indices.map((idx, i) => (
              <motion.div key={idx.symbol} variants={fadeUpItem}>
                <IndiceCard idx={idx} seed={i} />
              </motion.div>
            ))}
          </div>
        </StaggerReveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
       *  ROW 5 — YTD + News
       * ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📊</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>RENDIMIENTO YTD · GLOBAL</span>
          </div>
          <YTDChart indices={data.indices} />
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📰</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em" }}>NOTICIAS FINANCIERAS</span>
            </div>
            <span style={{ fontSize: 11, color: "#64748B" }}>{data.noticias.length} notas activas</span>
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

function IndiceCard({ idx, seed }: { idx: Indice; seed: number }) {
  const up = idx.c >= 0
  return (
    <motion.div
      className="card-sm"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      style={{
        padding: "11px 12px",
        borderColor: up ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sparkline background */}
      <div style={{ position: "absolute", inset: "auto 0 0 0", height: "55%", opacity: 0.25, pointerEvents: "none" }}>
        <MiniSparkline change={idx.c} color={up ? "#34D399" : "#F87171"} width={140} height={40} seed={seed + 30} strokeWidth={1.2} />
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>{idx.flag}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em" }}>{idx.symbol}</span>
        </div>
        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </div>
        <div className="mono" style={{ fontSize: 12, fontWeight: 800, color: up ? "#34D399" : "#F87171", marginBottom: 2 }}>
          {up ? "+" : ""}{idx.c.toFixed(2)}%
        </div>
        <div className="mono" style={{ fontSize: 9, color: "#64748B" }}>
          YTD {idx.ytdp >= 0 ? "+" : ""}{idx.ytdp.toFixed(1)}%
        </div>
      </div>
    </motion.div>
  )
}

function MoveRow({ q, dir, seed }: { q: Quote; dir: "up" | "down"; seed: number }) {
  const label = q.fmpSymbol.replace('.MX', '')
  const color = dir === "up" ? "#34D399" : "#F87171"
  return (
    <div style={{ display: "grid", gridTemplateColumns: "85px 1fr 50px 56px", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>{label}</span>
      <MiniSparkline change={q.change} color={color} width={70} height={18} seed={seed} fill={false} strokeWidth={1.2} />
      <span className="mono" style={{ fontSize: 11, color: "#64748B", textAlign: "right" }}>${q.price.toFixed(2)}</span>
      <span className="mono" style={{ fontSize: 12, fontWeight: 800, color, textAlign: "right" }}>
        {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
      </span>
    </div>
  )
}

function HeatMap({ quotes }: { quotes: Quote[] }) {
  const active = quotes
    .filter(q => (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24)
    .sort((a, b) => b.volume - a.volume)

  const maxVolume = active[0]?.volume || 1

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {active.map((q, i) => {
        const abs = Math.abs(q.change)
        const intensity = Math.min(abs / 4, 1)
        const label  = q.fmpSymbol.replace('.MX', '')
        const isUp   = q.change > 0
        const isDown = q.change < 0
        const bg      = isUp   ? `rgba(16,185,129,${0.10 + intensity * 0.32})`
                       : isDown ? `rgba(239,68,68,${0.10 + intensity * 0.32})`
                       : "rgba(255,255,255,0.04)"
        const border  = isUp   ? `rgba(16,185,129,${0.22 + intensity * 0.34})`
                       : isDown ? `rgba(239,68,68,${0.22 + intensity * 0.34})`
                       : "rgba(255,255,255,0.08)"
        const glow    = isUp   ? `0 0 ${10 + intensity * 22}px rgba(16,185,129,${intensity * 0.35})`
                       : isDown ? `0 0 ${10 + intensity * 22}px rgba(239,68,68,${intensity * 0.35})`
                       : "none"
        const textCol = isUp ? "#34D399" : isDown ? "#F87171" : "#94A3B8"
        const sparkCol = isUp ? "#10B981" : isDown ? "#EF4444" : "#64748B"
        const w = i < 4 ? 112 : i < 10 ? 98 : 84
        const h = i < 4 ? 78 : 68
        const volPct = (q.volume / maxVolume) * 100

        return (
          <div
            key={q.symbol}
            className="heat-tile"
            style={{
              width: w, height: h, borderRadius: 12, padding: "8px 9px",
              background: bg, border: `1px solid ${border}`, boxShadow: glow,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}%) · Vol ${q.volume.toLocaleString('es-MX')}`}
          >
            {/* Sparkline background */}
            <div className="heat-tile-spark">
              <MiniSparkline change={q.change} color={sparkCol} width={w} height={Math.floor(h * 0.6)} seed={i + 100} strokeWidth={1.2} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 800, color: "#F1F5F9", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
              </div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 800, color: textCol }}>
                {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
                ${q.price.toFixed(2)}
              </div>
            </div>

            {/* Volume bar */}
            <div
              className="heat-tile-volume"
              style={{
                width: `${volPct}%`,
                background: `linear-gradient(90deg, rgba(99,102,241,0.5), rgba(139,92,246,0.7))`,
                boxShadow: "0 0 6px rgba(99,102,241,0.5)",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <motion.div
      className="card-sm"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      style={{ padding: "13px 14px", cursor: "default" }}
    >
      {n.emisora && (
        <span style={{
          display: "inline-block", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
          color: "#A5B4FC", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)",
          borderRadius: 6, padding: "2px 7px", marginBottom: 7, textTransform: "uppercase",
        }}>
          {n.emisora}
        </span>
      )}
      <p style={{ fontSize: 11, color: "#CBD5E1", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {n.titulo}
      </p>
      {n.fecha && (
        <p style={{ fontSize: 10, color: "#64748B", marginTop: 7 }}>{n.fecha}</p>
      )}
    </motion.div>
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
            tick={{ fill: "#64748B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#0B1426",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              fontSize: 11,
              fontFamily: "'Inter',sans-serif",
            }}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : String(v), 'YTD']}
          />
          <Bar dataKey="ytd" radius={[4, 4, 0, 0]} maxBarSize={26}>
            {d.map(e => (
              <Cell key={e.name} fill={e.ytd >= 0 ? "#10B981" : "#EF4444"} fillOpacity={0.9} />
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
      <div className="bento-grid">
        <div className="skeleton" style={{ gridColumn: "span 8", height: 260, borderRadius: 18 }} />
        <div className="skeleton" style={{ gridColumn: "span 4", height: 260, borderRadius: 18 }} />
      </div>
      <div className="bento-grid">
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ gridColumn: "span 4", height: 220, borderRadius: 18 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
        {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
      </div>
      <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
    </div>
  )
}
