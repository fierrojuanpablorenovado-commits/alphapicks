'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BMVMarketPanel } from '@/components/BMVTicker'
import IntradiaChart from '@/components/IntradiaChart'
import MercadoGlobal from '@/components/MercadoGlobal'
import { AuroraMesh, FloatingStickers, MagneticButton } from '@/components/PremiumFx'

type Tab = 'overview' | 'intradia' | 'bmv' | 'us'

const TABS: { id: Tab; label: string; emoji: string; desc: string }[] = [
  { id: 'overview', label: 'Global',    emoji: '🌎', desc: 'Índices + Divisas + Noticias' },
  { id: 'intradia', label: 'Intradía',  emoji: '⚡', desc: 'Análisis técnico + IA' },
  { id: 'bmv',      label: 'IPC Table', emoji: '📊', desc: 'Emisoras en tiempo real' },
  { id: 'us',       label: 'EE.UU.',    emoji: '🇺🇸', desc: 'S&P 500 · Próximamente' },
]

const FADE = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: "easeOut" as const },
}

export default function MercadoPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>

      {/* ══ Aurora mesh background ══ */}
      <AuroraMesh intensity={0.55} />

      {/* ══ HERO SECTION ══ */}
      <section style={{ position: "relative", zIndex: 2, overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>

          {/* Floating emoji stickers in hero zone */}
          <FloatingStickers />

          {/* Content layer */}
          <div style={{ position: "relative", zIndex: 3, maxWidth: 780 }}>

            {/* Live + México badges */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 18 }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "5px 13px", borderRadius: 20,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.18)",
                backdropFilter: "blur(12px)",
              }}>
                <div className="live-dot" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: "0.08em" }}>EN VIVO</span>
              </div>

              <div className="trust-pill">
                <span style={{ fontSize: 13 }}>🇲🇽</span>
                <span>Bolsa Mexicana · Sesión activa</span>
              </div>

              <div className="trust-pill">
                <span style={{ color: "#F59E0B" }}>★★★★★</span>
                <span>4.9 · 12,400 inversionistas</span>
              </div>
            </motion.div>

            {/* MEGA Hero headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(40px, 5.5vw, 68px)",
                fontWeight: 900,
                letterSpacing: "-0.045em",
                lineHeight: 1,
                marginBottom: 14,
              }}
            >
              <span className="gradient-text">El mercado mexicano,</span>
              <br />
              <span className="gradient-brand">decodificado por IA.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                fontSize: 15, color: "#94A3B8", lineHeight: 1.55, maxWidth: 580, marginBottom: 28,
              }}
            >
              Señales de IA en vivo, sentimiento del IPC y análisis técnico minuto a minuto durante toda la sesión BMV.
              Sin ruido. Solo edge.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              <MagneticButton
                className="btn-brand"
                style={{ fontSize: 13, padding: "11px 24px" }}
                onClick={() => document.getElementById('mercado-bento')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver señales en vivo  →
              </MagneticButton>
              <MagneticButton
                className="btn-ghost"
                style={{ fontSize: 13 }}
                strength={0.18}
              >
                Probar gratis 7 días
              </MagneticButton>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                <span style={{ fontSize: 13 }}>🔒</span> Datos oficiales BMV vía DataBursatil
              </div>
              <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                <span style={{ fontSize: 13 }}>⚡</span> Cache 60s · uptime 99.9%
              </div>
              <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.08)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                <span style={{ fontSize: 13 }}>🤖</span> Modelo IA propietario (GPT-4 + finetune)
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ══ */}
      <div
        id="mercado-bento"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 64px", position: "relative", zIndex: 2 }}
      >

        {/* Tab bar — premium pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{
            display: "inline-flex",
            padding: 4,
            background: "rgba(8,11,18,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            gap: 2,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            marginBottom: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
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
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#F1F5F9" : "#64748B",
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  border: active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  letterSpacing: active ? "-0.01em" : "0",
                  boxShadow: active ? "0 1px 0 rgba(255,255,255,0.06) inset, 0 2px 10px rgba(0,0,0,0.2)" : "none",
                }}
              >
                <span style={{ fontSize: 13, filter: active ? "none" : "grayscale(0.4)" }}>{t.emoji}</span>
                {t.label}
              </button>
            )
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {tab === 'overview' && (
            <motion.div key="overview" {...FADE}>
              <MercadoGlobal />
            </motion.div>
          )}

          {tab === 'bmv' && (
            <motion.div key="bmv" {...FADE}>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
                  <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, color: "#F1F5F9", marginBottom: 4, letterSpacing: "-0.025em" }}>
                      <span>📊</span> Emisoras IPC — BMV
                    </h2>
                    <p style={{ fontSize: 12, color: "#475569" }}>
                      Actualización automática cada 60s · DataBursatil
                    </p>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                    background: "rgba(16,185,129,0.08)", borderRadius: 10,
                    border: "1px solid rgba(16,185,129,0.18)",
                  }}>
                    <div className="live-dot" />
                    <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
                  </div>
                </div>
                <BMVMarketPanel />
              </div>
            </motion.div>
          )}

          {tab === 'intradia' && (
            <motion.div key="intradia" {...FADE}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ marginBottom: 22 }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 800, color: "#F1F5F9", marginBottom: 4, letterSpacing: "-0.025em" }}>
                      <span>⚡</span> Análisis Intradía con IA
                    </h2>
                    <p style={{ fontSize: 12, color: "#475569" }}>
                      Bollinger Bands · RSI · MACD · Señales automáticas
                    </p>
                  </div>
                  <IntradiaChart />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { emoji: '⏱️', title: 'Minuto a minuto', desc: 'Intervalos 1m, 5m y 1h durante sesión BMV (8:30–15:00 CST).', accent: '#6366F1' },
                    { emoji: '🧠', title: 'RSI · MACD · BB',  desc: 'Tres indicadores combinados detectan zonas de compra/venta con nivel de confianza.', accent: '#10B981' },
                    { emoji: '⚡', title: 'Cache 60s',         desc: 'Datos actualizados automáticamente. Refresca en cualquier momento.', accent: '#F59E0B' },
                  ].map(c => (
                    <div key={c.title} className="card-sm" style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{c.emoji}</span>
                        <div style={{ width: 3, height: 18, borderRadius: 2, background: c.accent }} />
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 5 }}>{c.title}</h3>
                      <p style={{ fontSize: 11, color: "#475569", lineHeight: 1.55 }}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'us' && (
            <motion.div key="us" {...FADE}>
              <div className="card-gradient-border" style={{ padding: "80px 40px", textAlign: "center" }}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  style={{
                    width: 72, height: 72, borderRadius: 18, margin: "0 auto 24px",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                    boxShadow: "0 10px 40px rgba(99,102,241,0.25)",
                  }}
                >🇺🇸</motion.div>
                <h3 className="gradient-brand" style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.035em" }}>
                  S&P 500 en Tiempo Real
                </h3>
                <p style={{ fontSize: 14, color: "#64748B", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
                  Datos intradía del mercado americano vía Polygon.io WebSocket.
                  Candlestick + indicadores + señales IA. Disponible en plan Pro+.
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px",
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 11, fontSize: 12, color: "#A5B4FC", fontWeight: 700, letterSpacing: "0.02em",
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
