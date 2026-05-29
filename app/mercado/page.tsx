'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BMVMarketPanel } from '@/components/BMVTicker'
import IntradiaChart from '@/components/IntradiaChart'
import MercadoGlobal from '@/components/MercadoGlobal'

type Tab = 'overview' | 'intradia' | 'bmv' | 'us'

const TABS: { id: Tab; label: string; emoji: string; desc: string }[] = [
  { id: 'overview', label: 'Global',    emoji: '🌎', desc: 'Índices + Divisas + Noticias' },
  { id: 'intradia', label: 'Intradía',  emoji: '⚡', desc: 'Análisis técnico + IA' },
  { id: 'bmv',      label: 'IPC Table', emoji: '📊', desc: 'Emisoras en tiempo real' },
  { id: 'us',       label: 'EE.UU.',    emoji: '🇺🇸', desc: 'S&P 500 · Próximamente' },
]

const FADE = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: "easeOut" as const },
}

export default function MercadoPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%" }}>

      {/* Page header */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "22px 28px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--text-4)", fontSize: 12 }}>
                <span>Inicio</span>
                <span>›</span>
                <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Mercado</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: 10 }}>
                Mercado en tiempo real
                <span style={{ fontSize: 22 }}>🇲🇽</span>
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 3 }}>
                Datos en vivo · BMV · DataBursatil · Sesión 08:30 – 15:00 CST
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost">📥 Exportar</button>
              <button className="btn-brand">⭐ Añadir a watchlist</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{
            display: "inline-flex",
            padding: 4,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            gap: 2,
            marginTop: 18,
          }}>
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  title={t.desc}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--text-1)" : "var(--text-4)",
                    background: active ? "#fff" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: active ? "-0.01em" : "0",
                    boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, filter: active ? "none" : "grayscale(0.4)" }}>{t.emoji}</span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 28px 64px" }}>
        <AnimatePresence mode="wait">

          {tab === 'overview' && (
            <motion.div key="overview" {...FADE}>
              <MercadoGlobal />
            </motion.div>
          )}

          {tab === 'bmv' && (
            <motion.div key="bmv" {...FADE}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "var(--text-1)", marginBottom: 3, letterSpacing: "-0.02em" }}>
                      <span>📊</span> Emisoras IPC · BMV
                    </h2>
                    <p style={{ fontSize: 12, color: "var(--text-4)" }}>
                      Actualización automática cada 60s · DataBursatil
                    </p>
                  </div>
                  <div className="trust-pill" style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#047857" }}>
                    <div className="live-dot" /> LIVE
                  </div>
                </div>
                <BMVMarketPanel />
              </div>
            </motion.div>
          )}

          {tab === 'intradia' && (
            <motion.div key="intradia" {...FADE}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ marginBottom: 18 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "var(--text-1)", marginBottom: 3, letterSpacing: "-0.02em" }}>
                      <span>⚡</span> Análisis Intradía con IA
                    </h2>
                    <p style={{ fontSize: 12, color: "var(--text-4)" }}>
                      Bollinger Bands · RSI · MACD · Señales automáticas
                    </p>
                  </div>
                  <IntradiaChart />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { emoji: '⏱️', title: 'Minuto a minuto', desc: 'Intervalos 1m, 5m y 1h durante sesión BMV.', accent: '#6366F1' },
                    { emoji: '🧠', title: 'RSI · MACD · BB',  desc: 'Tres indicadores combinados detectan zonas de compra/venta.', accent: '#10B981' },
                    { emoji: '⚡', title: 'Cache 60s',         desc: 'Datos actualizados automáticamente.', accent: '#F59E0B' },
                  ].map(c => (
                    <div key={c.title} className="card-sm" style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{c.emoji}</span>
                        <div style={{ width: 3, height: 18, borderRadius: 2, background: c.accent }} />
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 5 }}>{c.title}</h3>
                      <p style={{ fontSize: 11, color: "var(--text-4)", lineHeight: 1.55 }}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'us' && (
            <motion.div key="us" {...FADE}>
              <div className="card-gradient-border" style={{ padding: "70px 40px", textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  style={{
                    width: 64, height: 64, borderRadius: 16, margin: "0 auto 18px",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
                  }}
                >🇺🇸</motion.div>
                <h3 className="gradient-brand" style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.03em" }}>
                  S&P 500 en Tiempo Real
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-4)", maxWidth: 420, margin: "0 auto 22px", lineHeight: 1.7 }}>
                  Datos intradía del mercado americano vía Polygon.io WebSocket.
                  Candlestick + indicadores + señales IA. Disponible en plan Pro+.
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px",
                  background: "var(--brand-soft)", border: "1px solid #C7D2FE",
                  borderRadius: 10, fontSize: 12, color: "#4F46E5", fontWeight: 700,
                }}>
                  <span>🚀</span> En desarrollo · Q3 2026
                </span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
