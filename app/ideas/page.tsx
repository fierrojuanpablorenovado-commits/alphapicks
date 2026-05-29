'use client'

import { motion } from 'framer-motion'
import { MiniSparkline, StaggerReveal, fadeUpItem } from '@/components/PremiumFx'

type Holding = { ticker: string; weight: number }

type Idea = {
  id: string
  emoji: string
  name: string
  author: string
  tagline: string
  description: string
  ytd: number
  oneYear: number
  threeYear: number
  stocks: number
  rebalance: string
  holdings: Holding[]
  accent: string
  accentSoft: string
  badge?: string
}

const IDEAS: Idea[] = [
  {
    id: 'buffett',
    emoji: '🦉',
    name: 'Portafolio Warren Buffett',
    author: 'Estilo Berkshire Hathaway',
    tagline: 'Value investing icónico',
    description: 'Réplica de las posiciones públicas del oráculo de Omaha. Empresas con foso duradero, flujo de caja sólido y precios razonables.',
    ytd: 14.3,
    oneYear: 22.8,
    threeYear: 58.4,
    stocks: 28,
    rebalance: 'Trimestral · post 13F',
    holdings: [
      { ticker: 'AAPL', weight: 26.4 },
      { ticker: 'BAC',  weight: 11.2 },
      { ticker: 'AXP',  weight: 8.7  },
      { ticker: 'KO',   weight: 7.1  },
    ],
    accent: '#0EA5E9',
    accentSoft: '#E0F2FE',
    badge: 'POPULAR',
  },
  {
    id: 'founder-led',
    emoji: '🚀',
    name: 'Founder-Led Companies',
    author: 'CEO = Fundador',
    tagline: 'El skin in the game importa',
    description: 'Empresas donde el fundador sigue al timón. Históricamente superan al S&P 500 en 3-5% anualizado por alineación de incentivos a largo plazo.',
    ytd: 28.6,
    oneYear: 41.3,
    threeYear: 124.7,
    stocks: 22,
    rebalance: 'Semestral',
    holdings: [
      { ticker: 'NVDA', weight: 14.2 },
      { ticker: 'META', weight: 12.5 },
      { ticker: 'TSLA', weight: 9.8  },
      { ticker: 'CRM',  weight: 7.6  },
    ],
    accent: '#8B5CF6',
    accentSoft: '#F3E8FF',
    badge: 'HOT',
  },
  {
    id: 'gates',
    emoji: '💻',
    name: 'Portafolio Bill Gates',
    author: 'Bill & Melinda Gates Foundation',
    tagline: 'Tech + filantropía',
    description: 'Holdings del trust de la fundación Gates. Concentrado, defensivo, con sesgo a empresas de calidad con dividendos reinvertibles.',
    ytd: 11.8,
    oneYear: 18.2,
    threeYear: 42.1,
    stocks: 18,
    rebalance: 'Trimestral · post 13F',
    holdings: [
      { ticker: 'MSFT', weight: 32.1 },
      { ticker: 'BRK.B',weight: 18.9 },
      { ticker: 'WM',   weight: 12.4 },
      { ticker: 'CAT',  weight: 8.3  },
    ],
    accent: '#06B6D4',
    accentSoft: '#CFFAFE',
  },
  {
    id: 'zombie',
    emoji: '🧟',
    name: 'Zombie Companies',
    author: 'Contrarian · Alto riesgo',
    tagline: 'Empresas que sobreviven, no prosperan',
    description: 'Empresa zombi = muy endeudada pero gana lo justo para seguir operando y atender el servicio de su deuda (no para pagarla). Oportunidad para inversionistas value y short-sellers cuando suben tasas.',
    ytd: -8.4,
    oneYear: -12.7,
    threeYear: -18.9,
    stocks: 34,
    rebalance: 'Mensual',
    holdings: [
      { ticker: 'AMC',  weight: 7.2 },
      { ticker: 'BBBY', weight: 6.1 },
      { ticker: 'CVNA', weight: 5.8 },
      { ticker: 'WEWK', weight: 5.4 },
    ],
    accent: '#DC2626',
    accentSoft: '#FEE2E2',
    badge: 'CONTRARIAN',
  },
  {
    id: 'dividends',
    emoji: '💎',
    name: 'Dividend Aristocrats',
    author: 'S&P 500 · 25+ años subiendo dividendos',
    tagline: 'Ingreso pasivo blindado',
    description: 'Empresas del S&P 500 con racha de 25+ años consecutivos aumentando su dividendo. Defensivo en crisis, ingreso predecible.',
    ytd: 7.2,
    oneYear: 13.8,
    threeYear: 36.5,
    stocks: 64,
    rebalance: 'Anual',
    holdings: [
      { ticker: 'JNJ', weight: 4.8 },
      { ticker: 'PG',  weight: 4.5 },
      { ticker: 'KO',  weight: 4.2 },
      { ticker: 'MCD', weight: 4.0 },
    ],
    accent: '#10B981',
    accentSoft: '#ECFDF5',
  },
  {
    id: 'mx-leaders',
    emoji: '🇲🇽',
    name: 'Líderes BMV',
    author: 'Top 10 IPC ponderado',
    tagline: 'Lo mejor de México',
    description: 'Las 10 emisoras más sólidas del IPC mexicano. Diversificado por sectores: consumo, minería, infraestructura, financiero.',
    ytd: 16.4,
    oneYear: 24.1,
    threeYear: 49.8,
    stocks: 10,
    rebalance: 'Trimestral',
    holdings: [
      { ticker: 'WALMEX',  weight: 18.4 },
      { ticker: 'AMXB',    weight: 14.7 },
      { ticker: 'FEMSAUBD',weight: 13.2 },
      { ticker: 'GFNORTEO',weight: 11.1 },
    ],
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',
    badge: 'NUEVO',
  },
]

const FILTERS = [
  { id: 'all',         label: 'Todos',         emoji: '🌟' },
  { id: 'famosos',     label: 'Famosos',       emoji: '🦉' },
  { id: 'crecimiento', label: 'Crecimiento',   emoji: '🚀' },
  { id: 'dividendos',  label: 'Dividendos',    emoji: '💎' },
  { id: 'contrarian',  label: 'Contrarian',    emoji: '🧟' },
  { id: 'mx',          label: 'México',        emoji: '🇲🇽' },
]

export default function IdeasPage() {
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
                <span style={{ color: "var(--text-2)", fontWeight: 600 }}>Ideas</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.025em", display: "flex", alignItems: "center", gap: 10 }}>
                Portafolios temáticos
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 5,
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  color: "#fff", letterSpacing: "0.1em",
                }}>NUEVO</span>
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-4)", marginTop: 4, maxWidth: 580 }}>
                Replica las estrategias de los inversionistas más famosos del mundo. Datos en vivo, rebalanceo automático, transparencia total.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost">📊 Comparador</button>
              <button className="btn-brand">⭐ Crear el mío</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
            {FILTERS.map((f, i) => (
              <button
                key={f.id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 13px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? "#fff" : "var(--text-3)",
                  background: i === 0 ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "var(--bg-card)",
                  border: i === 0 ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: i === 0 ? "0 2px 8px rgba(99,102,241,0.25)" : "none",
                }}
              >
                <span style={{ fontSize: 12, filter: i === 0 ? "none" : "grayscale(0.3)" }}>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 28px 64px" }}>

        {/* Stats strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18,
        }}>
          {[
            { label: 'Portafolios activos', value: '24', icon: '📦', color: '#6366F1' },
            { label: 'Mejor YTD',           value: '+28.6%', icon: '🚀', color: '#10B981' },
            { label: 'Inversionistas',      value: '12,400', icon: '👥', color: '#F59E0B' },
            { label: 'Capital total',       value: '$48.7M', icon: '💰', color: '#06B6D4' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${s.color}15`, border: `1px solid ${s.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>{s.icon}</div>
                <div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-4)", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
            borderRadius: 16,
            padding: "22px 28px",
            marginBottom: 18,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(99,102,241,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🤖</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em" }}>ALPHAAI · DESTACADO</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 6 }}>
                Tu portafolio personalizado por IA
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", maxWidth: 520, lineHeight: 1.5 }}>
                Cuéntale a AlphaAI tu perfil de riesgo, horizonte y sesgos. En 30 segundos genera un portafolio único, backtesteado contra 20 años.
              </p>
            </div>
            <button style={{
              background: "rgba(255,255,255,0.95)", color: "#4F46E5",
              border: "none", padding: "10px 22px", borderRadius: 11,
              fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.01em",
              boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            }}>
              Empezar con AlphaAI →
            </button>
          </div>

          {/* Decorative emojis */}
          <div style={{ position: "absolute", top: "-20px", right: "20px", fontSize: 100, opacity: 0.1 }}>🎯</div>
        </motion.div>

        {/* Section title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8 }}>
            🌟 Portafolios populares
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-4)", letterSpacing: "0" }}>· {IDEAS.length} disponibles</span>
          </h2>
          <button style={{ background: "none", border: "none", color: "#6366F1", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Ver todos →
          </button>
        </div>

        {/* Portfolio cards grid */}
        <StaggerReveal stagger={0.06}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
            {IDEAS.map(idea => (
              <motion.div key={idea.id} variants={fadeUpItem}>
                <IdeaCard idea={idea} />
              </motion.div>
            ))}
          </div>
        </StaggerReveal>

        {/* Bottom CTA */}
        <div style={{
          marginTop: 26,
          padding: "26px 28px",
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
              ¿No encuentras lo que buscas? 🎯
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-4)" }}>
              Crea tu propio portafolio temático. AlphaAI te ayuda a backtestar contra cualquier benchmark.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost">📚 Aprende cómo</button>
            <button className="btn-brand">Crear portafolio →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── IdeaCard ─────────────────────────────────────────────────────────────

function IdeaCard({ idea }: { idea: Idea }) {
  const up = idea.ytd >= 0
  const GREEN = "#10B981"
  const GREEN_DARK = "#047857"
  const RED = "#EF4444"
  const RED_DARK = "#B91C1C"

  return (
    <div
      className="idea-card"
      style={{
        ['--accent-from' as string]: idea.accentSoft,
      }}
    >
      {/* Top: emoji + name + badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: idea.accentSoft, border: `1px solid ${idea.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            flexShrink: 0,
          }}>
            {idea.emoji}
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.015em", lineHeight: 1.2 }}>
              {idea.name}
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2, fontWeight: 500 }}>
              {idea.author}
            </p>
          </div>
        </div>

        {idea.badge && (
          <span style={{
            fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 5,
            background: idea.accent, color: "#fff", letterSpacing: "0.1em", whiteSpace: "nowrap",
          }}>{idea.badge}</span>
        )}
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: 13, color: idea.accent, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8,
      }}>{idea.tagline}</p>

      {/* Description */}
      <p style={{
        fontSize: 12, color: "var(--text-3)", lineHeight: 1.55, marginBottom: 16,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {idea.description}
      </p>

      {/* Performance row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: 'YTD',  val: idea.ytd },
          { label: '1A',   val: idea.oneYear },
          { label: '3A',   val: idea.threeYear },
        ].map(p => {
          const pUp = p.val >= 0
          return (
            <div key={p.label} style={{
              background: "var(--bg-2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 10px",
            }}>
              <div className="label" style={{ fontSize: 9, marginBottom: 3 }}>{p.label}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 800, color: pUp ? GREEN_DARK : RED_DARK, lineHeight: 1 }}>
                {pUp ? "+" : ""}{p.val.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: 14, height: 36, background: idea.accentSoft, borderRadius: 8, padding: 6 }}>
        <MiniSparkline change={idea.ytd} color={up ? GREEN : RED} width={300} height={24} seed={idea.id.length * 7} strokeWidth={1.8} />
      </div>

      {/* Top holdings */}
      <div>
        <div className="label" style={{ marginBottom: 6 }}>TOP {Math.min(idea.holdings.length, 4)} HOLDINGS</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {idea.holdings.slice(0, 4).map(h => (
            <div key={h.ticker} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 7,
              background: "var(--bg-2)", border: "1px solid var(--border)",
            }}>
              <span className="mono" style={{ fontSize: 10, fontWeight: 800, color: "var(--text-1)" }}>{h.ticker}</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", fontWeight: 600 }}>{h.weight.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: rebalance + CTA */}
      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      }}>
        <div style={{ fontSize: 10, color: "var(--text-4)" }}>
          <span style={{ fontWeight: 700, color: "var(--text-3)" }}>{idea.stocks}</span> acciones · {idea.rebalance}
        </div>
        <button style={{
          background: "none", border: "none",
          color: idea.accent, fontSize: 12, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.01em",
        }}>
          Ver portafolio →
        </button>
      </div>
    </div>
  )
}
