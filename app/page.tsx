"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { strategies } from "@/lib/data";

const STATS = [
  { value: "+481%", label: "Retorno promedio 10a" },
  { value: "6", label: "Estrategias activas" },
  { value: "50+", label: "Métricas por acción" },
  { value: "25a", label: "Datos históricos" },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "IA entrenada con 25 años de datos",
    desc: "El modelo analiza más de 150 señales financieras por acción: momentum, calidad, valuación y deuda.",
    wide: true,
  },
  {
    icon: "🔄",
    title: "Rebalanceo mensual automático",
    desc: "El primer día hábil de cada mes recibes el portafolio actualizado por email.",
    wide: false,
  },
  {
    icon: "📊",
    title: "Métricas de riesgo completas",
    desc: "Sharpe, Sortino, Beta, Max Drawdown. Sabes exactamente qué riesgo tomas.",
    wide: false,
  },
  {
    icon: "🇲🇽",
    title: "BMV + NYSE/NASDAQ",
    desc: "El único sistema que cubre tanto la Bolsa Mexicana como los mercados americanos en un solo lugar.",
    wide: true,
  },
];

const STEPS = [
  { n: "01", title: "Elige tu estrategia", desc: "Selecciona entre Bolsa Mexicana, S&P 500, Tech, Value o Mid-Cap." },
  { n: "02", title: "La IA analiza el mercado", desc: "Cada mes el modelo evalúa miles de acciones y selecciona las mejores." },
  { n: "03", title: "Copia el portafolio", desc: "Recibes la lista de 10-20 acciones con pesos iguales. Tú decides cuánto invertir." },
];

export default function LandingPage() {
  return (
    <div style={{ background: "#0a0e1a" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Gradient blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 500, borderRadius: "50%", filter: "blur(120px)", opacity: 0.12,
          background: "radial-gradient(ellipse, #f97316 0%, #3b82f6 50%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="max-w-5xl mx-auto px-6 py-24 text-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "#111827", border: "1px solid #1e2d45", borderRadius: 999,
              padding: "6px 14px", marginBottom: 28 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
                boxShadow: "0 0 8px #22c55e", display: "inline-block" }} />
              <span style={{ color: "#94a3b8", fontSize: 13 }}>Actualizado · Jun 2026 · 6 estrategias activas</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}
            className="text-white mb-6">
            La IA que selecciona<br />
            <span style={{ background: "linear-gradient(90deg, #f97316, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              las mejores acciones
            </span>{" "}
            del mercado
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ color: "#94a3b8", fontSize: "1.15rem", maxWidth: 560, margin: "0 auto 36px" }}>
            Portafolios de 10–20 acciones seleccionadas por IA, rebalanceados cada mes. BMV y S&P 500.
            Sin análisis manual. Sin ruido.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/estrategias"
              style={{ background: "#f97316", borderRadius: 12, padding: "14px 32px",
                fontWeight: 700, fontSize: "1rem", color: "white" }}
              className="hover:opacity-90 transition-opacity">
              Ver estrategias gratis →
            </Link>
            <Link href="/pricing"
              style={{ background: "transparent", border: "1px solid #1e2d45", borderRadius: 12,
                padding: "14px 24px", fontWeight: 600, fontSize: "1rem", color: "#94a3b8" }}
              className="hover:border-slate-500 hover:text-white transition-all">
              Ver planes
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex justify-center gap-8 flex-wrap mt-14"
            style={{ borderTop: "1px solid #1e2d45", paddingTop: 28 }}>
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "white" }}>{value}</p>
                <p style={{ fontSize: 12, color: "#64748b" }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: 12 }}>
            Todo lo que necesitas para invertir mejor
          </h2>
          <p style={{ color: "#64748b" }}>Sin ruido. Sin predicciones subjetivas. Solo datos y modelo.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                background: "#111827", border: "1px solid #1e2d45", borderRadius: 16,
                padding: 28, gridColumn: f.wide ? "span 2" : "span 1",
              }}
              className="hover:border-orange-500/30 transition-all">
              <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontWeight: 700, color: "white", fontSize: "1.05rem", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ESTRATEGIAS PREVIEW ── */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: 10 }}>
            Estrategias activas ahora mismo
          </h2>
          <p style={{ color: "#64748b" }}>Backtesting 10 años. Rebalanceo mensual. Resultados reales desde Nov 2023.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((s, i) => (
            <motion.div key={s.slug}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}>
              <Link href={`/estrategias/${s.slug}`}
                style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 14, padding: 20, display: "block" }}
                className="hover:border-orange-500/40 transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <span style={{
                    background: s.market === 'MX' ? '#1a3a2a' : '#1a2a3a',
                    color: s.market === 'MX' ? '#22c55e' : '#60a5fa',
                    border: `1px solid ${s.market === 'MX' ? '#166534' : '#1e40af'}`,
                    fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600
                  }}>
                    {s.market === 'MX' ? '🇲🇽 BMV' : '🇺🇸 US'}
                  </span>
                  {s.badge && <span style={{ background: "#f97316", color: "white", fontSize: 10, padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>{s.badge}</span>}
                </div>
                <h3 style={{ fontWeight: 700, color: "white", fontSize: "0.95rem", marginBottom: 12 }}>{s.name}</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p style={{ color: "#64748b", fontSize: 11 }}>Retorno 10a</p>
                    <p style={{ color: "#22c55e", fontWeight: 800, fontSize: "1.4rem" }}>+{s.metrics.totalReturn.toFixed(0)}%</p>
                  </div>
                  <p style={{ color: "#f97316", fontSize: 12, fontWeight: 600 }}>Ver →</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/estrategias"
            style={{ border: "1px solid #1e2d45", color: "#94a3b8", borderRadius: 10, padding: "12px 28px", fontSize: "0.9rem" }}
            className="hover:border-slate-500 hover:text-white transition-all inline-block">
            Ver todas las estrategias
          </Link>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ borderTop: "1px solid #1e2d45", borderBottom: "1px solid #1e2d45" }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", textAlign: "center", marginBottom: 48 }}>
            Así de simple funciona
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#111827",
                  border: "1px solid #1e2d45", display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontWeight: 800, color: "#f97316", fontSize: "1.1rem" }}>
                  {step.n}
                </div>
                <h3 style={{ fontWeight: 700, color: "white", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: 12 }}>
            Desde <span style={{ color: "#f97316" }}>$279 MXN/mes</span>
          </h2>
          <p style={{ color: "#64748b", marginBottom: 28 }}>
            Menos que un almuerzo. Cancela cuando quieras.
          </p>
          <Link href="/pricing"
            style={{ background: "#f97316", borderRadius: 12, padding: "14px 36px",
              fontWeight: 700, color: "white", display: "inline-block" }}
            className="hover:opacity-90 transition-opacity">
            Ver planes →
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e2d45", background: "#080c14" }} className="py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ background: "#f97316", borderRadius: 8 }} className="w-7 h-7 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">α</span>
                </div>
                <span className="font-bold text-white">AlphaPicks</span>
              </div>
              <p style={{ color: "#475569", fontSize: "0.85rem", maxWidth: 260 }}>
                Selección de acciones con IA para inversores individuales en México y EE.UU.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
              {[
                { label: "Estrategias", href: "/estrategias" },
                { label: "Metodología", href: "/metodologia" },
                { label: "Planes", href: "/pricing" },
                { label: "Privacidad", href: "/legal/privacidad" },
                { label: "Términos", href: "/legal/terminos" },
                { label: "Datos", href: "/legal/datos" },
                { label: "Marca", href: "/legal/marca" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ color: "#475569" }} className="hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e2d45", paddingTop: 20 }}>
            <p style={{ color: "#334155", fontSize: "0.78rem", lineHeight: 1.6 }}>
              © 2026 AlphaPicks. Los resultados mostrados provienen de backtesting histórico y no garantizan rendimientos futuros.
              AlphaPicks no es un asesor de inversiones autorizado. Invierte bajo tu propio riesgo.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
