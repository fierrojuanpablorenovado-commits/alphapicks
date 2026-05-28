'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BMVMarketPanel } from '@/components/BMVTicker'
import IntradiaChart from '@/components/IntradiaChart'
import MercadoGlobal from '@/components/MercadoGlobal'

type Tab = 'overview' | 'intradia' | 'bmv' | 'us'

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: 'overview', label: 'Global',    desc: 'Índices + Divisas + Noticias' },
  { id: 'intradia', label: 'Intradía',  desc: 'Análisis técnico + IA' },
  { id: 'bmv',      label: 'IPC Table', desc: 'Emisoras en tiempo real' },
  { id: 'us',       label: 'EE.UU.',    desc: 'S&P 500 · Próximamente' },
]

const FADE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
}

export default function MercadoPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Hero header ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#10B981", letterSpacing: "0.04em" }}>
              EN VIVO
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", display: "inline-block", margin: "0 4px" }} />
            <span style={{ fontSize: 12, color: "#334155" }}>Sesión BMV 08:30 – 15:00 CST</span>
          </div>
          <h1
            className="gradient-text"
            style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 6 }}
          >
            Mercado en Tiempo Real
          </h1>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Datos en vivo · BMV · Fuente: DataBursatil
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── Tab bar premium ── */}
        <div
          style={{
            display: "inline-flex",
            padding: 4,
            background: "rgba(8,13,24,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            gap: 2,
          }}
        >
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                title={t.desc}
                style={{
                  padding: "7px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#F1F5F9" : "#475569",
                  background: active
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: active ? "-0.01em" : "0",
                  boxShadow: active ? "0 1px 0 rgba(255,255,255,0.06) inset" : "none",
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">

          {tab === 'overview' && (
            <motion.div key="overview" {...FADE}>
              <MercadoGlobal />
            </motion.div>
          )}

          {tab === 'bmv' && (
            <motion.div key="bmv" {...FADE}>
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 3, letterSpacing: "-0.02em" }}>
                      Emisoras IPC — BMV
                    </h2>
                    <p style={{ fontSize: 12, color: "#334155" }}>
                      Actualización automática cada 60s · DataBursatil
                    </p>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                    background: "rgba(16,185,129,0.07)", borderRadius: 8,
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}>
                    <div className="live-dot" />
                    <span style={{ fontSize: 11, color: "#10B981", fontWeight: 500, letterSpacing: "0.04em" }}>LIVE</span>
                  </div>
                </div>
                <BMVMarketPanel />
              </div>
            </motion.div>
          )}

          {tab === 'intradia' && (
            <motion.div key="intradia" {...FADE}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 3, letterSpacing: "-0.02em" }}>
                      Análisis Intradía con IA
                    </h2>
                    <p style={{ fontSize: 12, color: "#334155" }}>
                      Candlestick · Bollinger Bands · RSI · MACD · Señales automáticas
                    </p>
                  </div>
                  <IntradiaChart />
                </div>

                {/* Info pills */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { title: 'Minuto a minuto',   desc: 'Intervalos 1m, 5m y 1h durante sesión BMV (8:30–15:00 CST).', accent: '#6366F1' },
                    { title: 'RSI · MACD · BB',   desc: 'Tres indicadores combinados para detectar zonas de compra y venta con nivel de confianza.', accent: '#10B981' },
                    { title: 'Cache 60 s',         desc: 'Datos actualizados automáticamente. Refresca en cualquier momento.', accent: '#F59E0B' },
                  ].map(c => (
                    <div
                      key={c.title}
                      className="glass-card-sm"
                      style={{ padding: "14px 16px" }}
                    >
                      <div style={{ width: 3, height: 20, borderRadius: 2, background: c.accent, marginBottom: 10 }} />
                      <h3 style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", marginBottom: 4 }}>{c.title}</h3>
                      <p style={{ fontSize: 11, color: "#334155", lineHeight: 1.5 }}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'us' && (
            <motion.div key="us" {...FADE}>
              <div
                className="glass-card"
                style={{ padding: "80px 40px", textAlign: "center" }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, margin: "0 auto 20px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  🇺🇸
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 8, letterSpacing: "-0.03em" }}>
                  S&P 500 en Tiempo Real
                </h3>
                <p style={{ fontSize: 13, color: "#475569", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Datos intradía del mercado americano vía Polygon.io WebSocket.
                  Candlestick + indicadores + señales. Disponible en plan Pro+.
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
                  background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 8, fontSize: 12, color: "#818CF8", fontWeight: 500,
                }}>
                  En desarrollo · Q3 2026
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
