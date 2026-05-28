import { strategies } from "@/lib/data";
import StrategyCard from "@/components/StrategyCard";

export default function EstrategiasPage() {
  const mx = strategies.filter(s => s.market === 'MX');
  const us = strategies.filter(s => s.market === 'US');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ background: "#1a2235", color: "#f97316", border: "1px solid #7c2d12", fontSize: 12 }}
            className="px-3 py-1 rounded-full font-semibold">
            Actualizado · 1 Jun 2026
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          ProPicks IA — Encuentre acciones <span style={{ color: "#f97316" }}>ganadoras</span> con IA
        </h1>
        <p style={{ color: "#94a3b8" }} className="text-lg max-w-2xl">
          Portafolios de acciones seleccionadas por inteligencia artificial. Supera al mercado con estrategias basadas en 25+ años de datos y 50+ métricas financieras.
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-6 mt-6">
          {[
            { label: "Estrategias activas", value: `${strategies.length}` },
            { label: "Retorno promedio (10a)", value: "+481.5%" },
            { label: "vs Índices", value: "+352.8%" },
            { label: "Rebalanceo", value: "Mensual" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-white font-bold text-lg">{value}</p>
              <p style={{ color: "#64748b" }} className="text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mexico */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🇲🇽</span>
          <h2 className="text-xl font-bold text-white">Estrategias — Bolsa Mexicana</h2>
          <span style={{ background: "#1a3a2a", color: "#22c55e", border: "1px solid #166534", fontSize: 11 }}
            className="px-2 py-0.5 rounded-full font-semibold">
            {mx.length} estrategia{mx.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mx.map(s => <StrategyCard key={s.slug} strategy={s} />)}
        </div>
      </section>

      {/* USA */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🇺🇸</span>
          <h2 className="text-xl font-bold text-white">Estrategias — Mercado Americano</h2>
          <span style={{ background: "#1a2a3a", color: "#60a5fa", border: "1px solid #1e40af", fontSize: 11 }}
            className="px-2 py-0.5 rounded-full font-semibold">
            {us.length} estrategias
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {us.map(s => <StrategyCard key={s.slug} strategy={s} />)}
        </div>
      </section>

      {/* Disclaimer */}
      <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 10 }} className="p-4">
        <p style={{ color: "#475569" }} className="text-xs leading-relaxed">
          <span className="font-semibold text-slate-400">Aviso legal:</span> Los resultados mostrados provienen de backtesting histórico y no garantizan rendimientos futuros.
          La rentabilidad pasada no es indicativa de resultados futuros. AlphaPicks no es un asesor de inversiones autorizado.
          Consulte a su asesor financiero antes de invertir.
        </p>
      </div>
    </div>
  );
}
