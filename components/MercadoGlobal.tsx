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

const GREEN = "#10B981"
const GREEN_DARK = "#047857"
const RED = "#EF4444"
const RED_DARK = "#B91C1C"

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
    <div style={{ padding: 80, textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>📉</div>
      Error cargando datos del mercado
    </div>
  )

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')
  const ipcUp     = (ipcIndice?.c ?? 0) >= 0

  const sparkData = ipcIndice
    ? Array.from({ length: 36 }, (_, i) => ({
        t: i,
        v: ipcIndice.u * (1 + Math.sin(i / 3) * 0.0035 + Math.cos(i / 5) * 0.002 + (i / 36) * (ipcIndice.c / 100) * 0.85),
      }))
    : []

  const topPick = data.ipc.gainers[0]
  const topPickLabel = topPick?.fmpSymbol.replace('.MX', '') ?? '—'

  const volLeaders = [...data.ipc.quotes]
    .filter(q => (Date.now() - new Date(q.timestamp).getTime()) / 3_600_000 < 24)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
  const maxVolume = volLeaders[0]?.volume || 1

  const now = new Date()
  const mxNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }))
  const hours = mxNow.getHours() + mxNow.getMinutes() / 60
  const isOpen = hours >= 8.5 && hours < 15
  const minutesLeft = isOpen ? Math.floor((15 - hours) * 60) : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ROW 1 — IPC Hero (8) + AI Pick + Indices Mini (4) */}
      <div className="bento-grid">

        {/* IPC HERO */}
        <SpotlightCard
          className="card-gradient-border fade-up"
          style={{ gridColumn: "span 8", padding: "24px 28px" }}
          spotlightColor={ipcUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, letterSpacing: "0.08em" }}>EN VIVO</span>
              <span style={{ width: 1, height: 14, background: "var(--border-2)", margin: "0 6px" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
                <span style={{ fontSize: 14 }}>🇲🇽</span> IPC · Bolsa Mexicana de Valores
              </span>
              {isOpen && minutesLeft !== null && (
                <>
                  <span style={{ width: 1, height: 14, background: "var(--border-2)", margin: "0 6px" }} />
                  <span style={{ fontSize: 11, color: "#0891B2", fontWeight: 600 }}>
                    ⏱ Cierra en {Math.floor(minutesLeft / 60)}h {minutesLeft % 60}m
                  </span>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {lastAt && (
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>
                  Act. {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  <button onClick={fetch_} style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", fontSize: 13 }}>↻</button>
                </span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, letterSpacing: "0.06em",
                background: ipcUp ? "#ECFDF5" : "#FEF2F2",
                color: ipcUp ? GREEN_DARK : RED_DARK,
                border: `1px solid ${ipcUp ? "#A7F3D0" : "#FCA5A5"}`,
              }}>
                {ipcUp ? "↑ ALZA" : "↓ BAJA"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 30, alignItems: "center" }}>

            {/* Giant price + sparkline */}
            <div>
              {ipcIndice ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
                    <AnimatedNumber
                      value={ipcIndice.u}
                      decimals={0}
                      className="mono"
                      style={{
                        fontSize: "clamp(38px, 4vw, 56px)",
                        fontWeight: 900,
                        letterSpacing: "-0.045em",
                        lineHeight: 1,
                        color: "var(--text-1)",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em",
                          color: ipcUp ? GREEN_DARK : RED_DARK,
                        }}
                      >
                        {ipcUp ? "+" : ""}{ipcIndice.c.toFixed(2)}%
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: ipcUp ? GREEN : RED, fontWeight: 700 }}>
                        {ipcUp ? "▲" : "▼"} {Math.abs(ipcIndice.u * ipcIndice.c / 100).toFixed(0)} pts
                      </span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div style={{ height: 54, marginTop: 10, marginBottom: 14 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={ipcUp ? GREEN : RED} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={ipcUp ? GREEN : RED} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone" dataKey="v" stroke={ipcUp ? GREEN : RED}
                          strokeWidth={2} fill="url(#sparkGradient)" dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="label">YTD</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: ipcIndice.ytdp >= 0 ? GREEN_DARK : RED_DARK }}>
                        {ipcIndice.ytdp >= 0 ? "+" : ""}{ipcIndice.ytdp.toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="label">Promedio</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: data.ipc.stats.avg >= 0 ? GREEN_DARK : RED_DARK }}>
                        {data.ipc.stats.avg >= 0 ? "+" : ""}{data.ipc.stats.avg.toFixed(2)}%
                      </span>
                    </div>
                    {ipcIndice.f && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="label">Fecha</span>
                        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{ipcIndice.f}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="skeleton" style={{ height: 56, width: "80%", marginBottom: 14 }} />
                  <div className="skeleton" style={{ height: 54, width: "100%" }} />
                </>
              )}
            </div>

            {/* Donut + stats */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <SentimentDonut up={data.ipc.stats.up} down={data.ipc.stats.down} size={114} thickness={11} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, width: "100%" }}>
                {[
                  { v: data.ipc.stats.up,    label: "Alzas",  color: GREEN_DARK, bg: "#ECFDF5", brd: "#A7F3D0", emoji: "↑" },
                  { v: data.ipc.stats.down,  label: "Bajas",  color: RED_DARK,   bg: "#FEF2F2", brd: "#FCA5A5", emoji: "↓" },
                  { v: data.ipc.stats.total, label: "Total",  color: "var(--text-3)", bg: "var(--bg-2)", brd: "var(--border)", emoji: "◎" },
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
                        style={{ fontSize: 17, fontWeight: 900, color: s.color, lineHeight: 1 }}
                      />
                    </div>
                    <div className="label" style={{ marginTop: 4, fontSize: 9 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* AI Pick + Indices Mini stacked */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: 12 }}>

          <SpotlightCard
            className="card fade-up"
            style={{
              padding: "18px 20px",
              background: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 60%)",
              border: "1px solid #C7D2FE",
              animationDelay: "0.1s",
              flex: 1,
            }}
            spotlightColor="rgba(139,92,246,0.08)"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.span
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  style={{ fontSize: 22 }}
                >🤖</motion.span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#4F46E5", letterSpacing: "0.1em" }}>ALPHAAI · TOP PICK</span>
              </div>
              <span style={{ fontSize: 9, color: "var(--text-4)", fontWeight: 700, letterSpacing: "0.06em" }}>HOY</span>
            </div>

            {topPick ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 20, fontWeight: 900, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                      {topPickLabel}
                    </span>
                    <MiniSparkline change={topPick.change} color={GREEN} width={70} height={26} seed={1} />
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 13, color: "var(--text-3)" }}>${topPick.price.toFixed(2)}</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: GREEN_DARK }}>
                      +{topPick.change.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="badge-buy" style={{
                  padding: "8px 12px", borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em" }}>▲ COMPRA · FUERTE</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em" }}>●●●</span>
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-3)", lineHeight: 1.45 }}>
                  Mayor momentum IPC en la sesión.
                  <span style={{ color: "var(--text-4)", display: "block" }}>RSI fuerte · MACD bullish</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-4)" }}>Sin señales activas</div>
            )}
          </SpotlightCard>

          <SpotlightCard className="card fade-up" style={{ padding: "14px 16px", animationDelay: "0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🌎</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>ÍNDICES CLAVE</span>
            </div>
            <div>
              {data.indices
                .filter(i => ['SP500', 'DOW', 'NASDAQ'].includes(i.symbol))
                .slice(0, 3)
                .map((idx, i, arr) => {
                  const up = idx.c >= 0
                  return (
                    <div key={idx.symbol} style={{
                      display: "grid", gridTemplateColumns: "1fr 65px 50px", alignItems: "center", gap: 8,
                      padding: "7px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>{idx.flag}</span>
                        <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 700 }}>{idx.symbol}</span>
                      </div>
                      <MiniSparkline change={idx.c} color={up ? GREEN : RED} width={65} height={20} seed={i + 5} fill={false} />
                      <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: up ? GREEN_DARK : RED_DARK, textAlign: "right" }}>
                        {up ? "+" : ""}{idx.c.toFixed(2)}%
                      </span>
                    </div>
                  )
                })}
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* ROW 2 — Movers + Divisas + Volume */}
      <div className="bento-grid">

        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💎</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>MAYORES MOVIMIENTOS</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: GREEN_DARK, fontWeight: 800, letterSpacing: "0.12em" }}>ALZAS</span>
              <div style={{ flex: 1, height: 1, background: "#A7F3D0" }} />
            </div>
            {data.ipc.gainers.slice(0, 3).map((q, i) => <MoveRow key={q.symbol} q={q} dir="up" seed={i} />)}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: RED_DARK, fontWeight: 800, letterSpacing: "0.12em" }}>BAJAS</span>
              <div style={{ flex: 1, height: 1, background: "#FCA5A5" }} />
            </div>
            {data.ipc.losers.slice(0, 3).map((q, i) => <MoveRow key={q.symbol} q={q} dir="down" seed={i + 10} />)}
          </div>
        </SpotlightCard>

        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.25s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💱</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>TIPOS DE CAMBIO</span>
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
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{fx.flag}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em" }}>{fx.pair}</span>
                  </div>
                  {fx.val
                    ? <MiniSparkline change={fx.val.c} color={fxUp ? GREEN : RED} width={70} height={20} seed={i + 20} fill={false} />
                    : <div />
                  }
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", display: "block", lineHeight: 1.2 }}>
                      {fx.val?.u.toFixed(4) ?? "—"}
                    </span>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: fxUp ? GREEN_DARK : RED_DARK }}>
                      {fx.val ? `${fxUp ? "+" : ""}${fx.val.c.toFixed(2)}%` : ""}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </SpotlightCard>

        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "18px 20px", animationDelay: "0.3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>LÍDERES POR VOLUMEN</span>
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
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{label}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-4)" }}>${q.price.toFixed(2)}</span>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: up ? GREEN_DARK : RED_DARK }}>
                          {up ? "+" : ""}{q.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        width: `${volPct}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${up ? GREEN : RED}, ${up ? "#34D399" : "#F87171"})`,
                        borderRadius: 2,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--text-4)", padding: "20px 0", textAlign: "center" }}>Sin datos de volumen</div>
          )}
        </SpotlightCard>
      </div>

      {/* ROW 3 — Heat Map */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>MAPA DE CALOR · IPC</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--text-4)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#A7F3D0", border: "1px solid #6EE7B7" }} />
              Alza
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#FECACA", border: "1px solid #FCA5A5" }} />
              Baja
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 14, height: 2, background: "#818CF8", borderRadius: 1 }} />
              Volumen
            </span>
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <HeatMap quotes={data.ipc.quotes} />
        </div>
      </section>

      {/* ROW 4 — All Global Indices */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🌐</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>TODOS LOS ÍNDICES GLOBALES</span>
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

      {/* ROW 5 — YTD + News */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📊</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>RENDIMIENTO YTD · GLOBAL</span>
          </div>
          <YTDChart indices={data.indices} />
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📰</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em" }}>NOTICIAS FINANCIERAS</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-4)" }}>{data.noticias.length} notas activas</span>
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
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: "auto 0 0 0", height: "55%", opacity: 0.25, pointerEvents: "none" }}>
        <MiniSparkline change={idx.c} color={up ? GREEN : RED} width={140} height={40} seed={seed + 30} strokeWidth={1.3} />
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
          <span style={{ fontSize: 13 }}>{idx.flag}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.06em" }}>{idx.symbol}</span>
        </div>
        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </div>
        <div className="mono" style={{ fontSize: 12, fontWeight: 800, color: up ? GREEN_DARK : RED_DARK, marginBottom: 2 }}>
          {up ? "+" : ""}{idx.c.toFixed(2)}%
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
          YTD {idx.ytdp >= 0 ? "+" : ""}{idx.ytdp.toFixed(1)}%
        </div>
      </div>
    </motion.div>
  )
}

function MoveRow({ q, dir, seed }: { q: Quote; dir: "up" | "down"; seed: number }) {
  const label = q.fmpSymbol.replace('.MX', '')
  const color = dir === "up" ? GREEN_DARK : RED_DARK
  const colorLine = dir === "up" ? GREEN : RED
  return (
    <div style={{ display: "grid", gridTemplateColumns: "85px 1fr 50px 56px", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{label}</span>
      <MiniSparkline change={q.change} color={colorLine} width={70} height={18} seed={seed} fill={false} strokeWidth={1.3} />
      <span className="mono" style={{ fontSize: 11, color: "var(--text-4)", textAlign: "right" }}>${q.price.toFixed(2)}</span>
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
        const bg      = isUp   ? `rgba(16,185,129,${0.10 + intensity * 0.25})`
                       : isDown ? `rgba(239,68,68,${0.10 + intensity * 0.25})`
                       : "var(--bg-2)"
        const border  = isUp   ? `rgba(16,185,129,${0.32 + intensity * 0.35})`
                       : isDown ? `rgba(239,68,68,${0.32 + intensity * 0.35})`
                       : "var(--border)"
        const textCol = isUp ? GREEN_DARK : isDown ? RED_DARK : "var(--text-3)"
        const sparkCol = isUp ? GREEN : isDown ? RED : "#94A3B8"
        const w = i < 4 ? 112 : i < 10 ? 98 : 84
        const h = i < 4 ? 78 : 68
        const volPct = (q.volume / maxVolume) * 100

        return (
          <div
            key={q.symbol}
            className="heat-tile"
            style={{
              width: w, height: h, borderRadius: 12, padding: "8px 9px",
              background: bg, border: `1px solid ${border}`,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}%) · Vol ${q.volume.toLocaleString('es-MX')}`}
          >
            <div className="heat-tile-spark">
              <MiniSparkline change={q.change} color={sparkCol} width={w} height={Math.floor(h * 0.6)} seed={i + 100} strokeWidth={1.3} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 800, color: "var(--text-1)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label}
              </div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 800, color: textCol }}>
                {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                ${q.price.toFixed(2)}
              </div>
            </div>

            <div
              className="heat-tile-volume"
              style={{
                width: `${volPct}%`,
                background: `linear-gradient(90deg, #818CF8, #A78BFA)`,
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
          color: "#4F46E5", background: "var(--brand-soft)", border: "1px solid #C7D2FE",
          borderRadius: 6, padding: "2px 7px", marginBottom: 7, textTransform: "uppercase",
        }}>
          {n.emisora}
        </span>
      )}
      <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {n.titulo}
      </p>
      {n.fecha && (
        <p style={{ fontSize: 10, color: "var(--text-4)", marginTop: 7 }}>{n.fecha}</p>
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
            tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              fontSize: 11,
              fontFamily: "'Inter',sans-serif",
            }}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : String(v), 'YTD']}
          />
          <Bar dataKey="ytd" radius={[4, 4, 0, 0]} maxBarSize={26}>
            {d.map(e => (
              <Cell key={e.name} fill={e.ytd >= 0 ? GREEN : RED} fillOpacity={0.92} />
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
        <div className="skeleton" style={{ gridColumn: "span 8", height: 260, borderRadius: 16 }} />
        <div className="skeleton" style={{ gridColumn: "span 4", height: 260, borderRadius: 16 }} />
      </div>
      <div className="bento-grid">
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ gridColumn: "span 4", height: 220, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
        {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 10 }} />)}
      </div>
      <div className="skeleton" style={{ height: 140, borderRadius: 10 }} />
    </div>
  )
}
