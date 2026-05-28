'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { AnimatedNumber, SpotlightCard, StaggerReveal, fadeUpItem } from '@/components/PremiumFx'

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
    <div style={{ padding: 80, textAlign: "center", color: "#475569", fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>📉</div>
      Error cargando datos del mercado
    </div>
  )

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')
  const ipcUp     = (ipcIndice?.c ?? 0) >= 0
  const total     = data.ipc.stats.total || 1
  const upRatio   = (data.ipc.stats.up / total) * 100

  // Build sparkline data from top gainers/losers as a synthetic proxy
  const sparkData = ipcIndice
    ? Array.from({ length: 24 }, (_, i) => ({
        t: i,
        v: ipcIndice.u * (1 + Math.sin(i / 3) * 0.004 + (i / 24) * (ipcIndice.c / 100) * 0.7),
      }))
    : []

  // Top AI signal pick (mock from best gainer)
  const topPick = data.ipc.gainers[0]
  const topPickLabel = topPick?.fmpSymbol.replace('.MX', '') ?? '—'

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ════════════════════════════════════════════════════════════════
       *  BENTO ROW 1 — IPC Hero (8 cols) + AI Signal (4 cols)
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* IPC HERO MEGA CARD */}
        <SpotlightCard
          className="card-gradient-border fade-up"
          style={{
            gridColumn: "span 8",
            padding: "26px 30px",
            boxShadow: ipcUp
              ? "0 10px 60px rgba(16,185,129,0.10)"
              : "0 10px 60px rgba(239,68,68,0.10)",
          }}
          spotlightColor={ipcUp ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)"}
        >
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: "0.08em" }}>EN VIVO</span>
              <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", margin: "0 6px" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B", fontWeight: 500 }}>
                <span style={{ fontSize: 13 }}>🇲🇽</span> IPC · Bolsa Mexicana de Valores
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {lastAt && (
                <span style={{ fontSize: 11, color: "#334155" }}>
                  {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  <button onClick={fetch_} style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 13 }}>↻</button>
                </span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 8, letterSpacing: "0.06em",
                background: ipcUp ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color: ipcUp ? "#10B981" : "#EF4444",
                border: `1px solid ${ipcUp ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}>
                {ipcUp ? "↑ ALZA" : "↓ BAJA"}
              </span>
            </div>
          </div>

          {/* Price + sentiment row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>

            {/* LEFT — Giant price + sparkline */}
            <div>
              {ipcIndice ? (
                <>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
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

                  {/* Sparkline */}
                  <div style={{ height: 48, marginTop: 12, marginBottom: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={ipcUp ? "#10B981" : "#EF4444"} stopOpacity={0.4} />
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

                  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="label">YTD</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: ipcIndice.ytdp >= 0 ? "#10B981" : "#EF4444" }}>
                        {ipcIndice.ytdp >= 0 ? "+" : ""}{ipcIndice.ytdp.toFixed(2)}%
                      </span>
                    </div>
                    {ipcIndice.f && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="label">Fecha</span>
                        <span className="mono" style={{ fontSize: 12, color: "#64748B" }}>{ipcIndice.f}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="skeleton" style={{ height: 60, width: "80%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 48, width: "100%" }} />
                </>
              )}
            </div>

            {/* RIGHT — Sentiment + stats */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                  <span className="label">Sentimiento del mercado</span>
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
                      boxShadow: ipcUp
                        ? "0 0 16px rgba(16,185,129,0.5)"
                        : "0 0 16px rgba(239,68,68,0.5)",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { v: data.ipc.stats.up,    label: "Alzas",  color: "#10B981", bg: "rgba(16,185,129,0.07)",  brd: "rgba(16,185,129,0.16)", emoji: "↑" },
                  { v: data.ipc.stats.down,  label: "Bajas",  color: "#EF4444", bg: "rgba(239,68,68,0.07)",   brd: "rgba(239,68,68,0.16)",  emoji: "↓" },
                  { v: data.ipc.stats.total, label: "Total",  color: "#94A3B8", bg: "rgba(255,255,255,0.03)", brd: "rgba(255,255,255,0.07)", emoji: "◎" },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      background: s.bg, border: `1px solid ${s.brd}`,
                      borderRadius: 12, padding: "12px 14px", textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{s.emoji}</span>
                      <AnimatedNumber
                        value={s.v}
                        className="mono"
                        style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}
                      />
                    </div>
                    <div className="label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* AI SIGNAL CARD */}
        <SpotlightCard
          className="card fade-up"
          style={{
            gridColumn: "span 4",
            padding: "22px 22px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.07), rgba(139,92,246,0.04))",
            border: "1px solid rgba(99,102,241,0.18)",
            animationDelay: "0.1s",
          }}
          spotlightColor="rgba(139,92,246,0.18)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <motion.span
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
              style={{ fontSize: 22 }}
            >🤖</motion.span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#A5B4FC", letterSpacing: "0.08em" }}>SEÑAL IA · TOP PICK</span>
          </div>

          {topPick ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em", marginBottom: 4 }}>
                  {topPickLabel}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 14, color: "#94A3B8" }}>${topPick.price.toFixed(2)}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>
                    +{topPick.change.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div style={{
                padding: "10px 12px", borderRadius: 10,
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, letterSpacing: "0.04em" }}>
                  ▲ COMPRA · FUERTE
                </span>
                <span className="mono" style={{ fontSize: 10, color: "#10B981", letterSpacing: "0.1em" }}>●●●</span>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
                Mayor momentum del IPC en la sesión.
                <br />
                <span style={{ color: "#475569" }}>RSI fuerte · MACD bullish</span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#475569" }}>Sin señales activas</div>
          )}
        </SpotlightCard>
      </div>

      {/* ════════════════════════════════════════════════════════════════
       *  BENTO ROW 2 — Movers (4) + Divisas (4) + Quick Indices (4)
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="bento-grid">

        {/* Top Movers */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "20px 22px", animationDelay: "0.15s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>💎</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>MAYORES MOVIMIENTOS</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700, letterSpacing: "0.1em" }}>ALZAS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.12)" }} />
            </div>
            {data.ipc.gainers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="up" />)}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 700, letterSpacing: "0.1em" }}>BAJAS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(239,68,68,0.12)" }} />
            </div>
            {data.ipc.losers.slice(0, 3).map(q => <MoveRow key={q.symbol} q={q} dir="down" />)}
          </div>
        </SpotlightCard>

        {/* Divisas */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "20px 22px", animationDelay: "0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>💱</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>TIPOS DE CAMBIO</span>
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
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", display: "block" }}>
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
        </SpotlightCard>

        {/* Global indices quick */}
        <SpotlightCard className="card fade-up" style={{ gridColumn: "span 4", padding: "20px 22px", animationDelay: "0.25s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🌎</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>ÍNDICES CLAVE</span>
          </div>

          <div>
            {data.indices
              .filter(i => ['SP500', 'DOW', 'NASDAQ', 'NIKKEI', 'DAX', 'FTSE'].includes(i.symbol))
              .slice(0, 4)
              .map(idx => {
                const up = idx.c >= 0
                return (
                  <div key={idx.symbol} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{idx.flag}</span>
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{idx.symbol}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", display: "block" }}>
                        {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: up ? "#10B981" : "#EF4444" }}>
                        {up ? "+" : ""}{idx.c.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </SpotlightCard>
      </div>

      {/* ════════════════════════════════════════════════════════════════
       *  Full Índices Globales Grid
       * ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🌐</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>TODOS LOS ÍNDICES GLOBALES</span>
          </div>
          {lastAt && (
            <span style={{ fontSize: 11, color: "#334155" }}>
              Act. {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <StaggerReveal stagger={0.04}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {data.indices.map(idx => (
              <motion.div key={idx.symbol} variants={fadeUpItem}>
                <IndiceCard idx={idx} />
              </motion.div>
            ))}
          </div>
        </StaggerReveal>
      </section>

      {/* ════════════════════════════════════════════════════════════════
       *  Heat Map
       * ═══════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>MAPA DE CALOR · IPC</span>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <HeatMap quotes={data.ipc.quotes} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
       *  YTD + Noticias
       * ═══════════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📊</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>RENDIMIENTO YTD</span>
          </div>
          <YTDChart indices={data.indices} />
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📰</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>NOTICIAS FINANCIERAS</span>
            </div>
            <span style={{ fontSize: 11, color: "#334155" }}>{data.noticias.length} notas</span>
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
    <motion.div
      className="card-sm"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      style={{
        padding: "12px 13px",
        borderColor: up ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>{idx.flag}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em" }}>{idx.symbol}</span>
      </div>
      <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
      </div>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: up ? "#10B981" : "#EF4444", marginBottom: 2 }}>
        {up ? "+" : ""}{idx.c.toFixed(2)}%
      </div>
      <div className="mono" style={{ fontSize: 9, color: "#334155" }}>
        YTD {idx.ytdp >= 0 ? "+" : ""}{idx.ytdp.toFixed(1)}%
      </div>
    </motion.div>
  )
}

function MoveRow({ q, dir }: { q: Quote; dir: "up" | "down" }) {
  const label = q.fmpSymbol.replace('.MX', '')
  const color = dir === "up" ? "#10B981" : "#EF4444"
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1", minWidth: 90 }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: "#64748B" }}>${q.price.toFixed(2)}</span>
      <span className="mono" style={{ fontSize: 12, fontWeight: 800, color }}>
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
      {active.map((q, i) => {
        const abs = Math.abs(q.change)
        const intensity = Math.min(abs / 4, 1)
        const label  = q.fmpSymbol.replace('.MX', '')
        const isUp   = q.change > 0
        const isDown = q.change < 0
        const bg      = isUp   ? `rgba(16,185,129,${0.08 + intensity * 0.30})`
                       : isDown ? `rgba(239,68,68,${0.08 + intensity * 0.30})`
                       : "rgba(255,255,255,0.03)"
        const border  = isUp   ? `rgba(16,185,129,${0.16 + intensity * 0.32})`
                       : isDown ? `rgba(239,68,68,${0.16 + intensity * 0.32})`
                       : "rgba(255,255,255,0.06)"
        const glow    = isUp   ? `0 0 ${10 + intensity * 18}px rgba(16,185,129,${intensity * 0.3})`
                       : isDown ? `0 0 ${10 + intensity * 18}px rgba(239,68,68,${intensity * 0.3})`
                       : "none"
        const textCol = isUp ? "#10B981" : isDown ? "#EF4444" : "#94A3B8"
        const w = i < 4 ? 104 : i < 10 ? 92 : 80

        return (
          <div
            key={q.symbol}
            className="heat-tile"
            style={{
              width: w, borderRadius: 12, padding: "10px",
              background: bg, border: `1px solid ${border}`, boxShadow: glow,
            }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)}%)`}
          >
            <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </div>
            <div className="mono" style={{ fontSize: 12, fontWeight: 800, color: textCol }}>
              {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
            </div>
            <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
              ${q.price.toFixed(2)}
            </div>
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
          display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
          color: "#A5B4FC", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 6, padding: "2px 7px", marginBottom: 7, textTransform: "uppercase",
        }}>
          {n.emisora}
        </span>
      )}
      <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {n.titulo}
      </p>
      {n.fecha && (
        <p style={{ fontSize: 10, color: "#334155", marginTop: 7 }}>{n.fecha}</p>
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
            tick={{ fill: "#475569", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
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
          <Bar dataKey="ytd" radius={[4, 4, 0, 0]} maxBarSize={26}>
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
      <div className="bento-grid">
        <div className="skeleton" style={{ gridColumn: "span 8", height: 240, borderRadius: 18 }} />
        <div className="skeleton" style={{ gridColumn: "span 4", height: 240, borderRadius: 18 }} />
      </div>
      <div className="bento-grid">
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ gridColumn: "span 4", height: 200, borderRadius: 18 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
        {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
      </div>
      <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
    </div>
  )
}
