import { notFound } from "next/navigation";
import Link from "next/link";
import { getStrategy, strategies } from "@/lib/data";
import PerformanceChart from "@/components/PerformanceChart";
import MetricsGrid from "@/components/MetricsGrid";
import StockTable from "@/components/StockTable";

export function generateStaticParams() {
  return strategies.map(s => ({ slug: s.slug }));
}

export default function StrategyPage({ params }: { params: { slug: string } }) {
  const strategy = getStrategy(params.slug);
  if (!strategy) notFound();

  const s = strategy;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "#64748b" }}>
        <Link href="/estrategias" className="hover:text-white transition-colors">Estrategias</Link>
        <span>/</span>
        <span className="text-white">{s.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span style={{
              background: s.market === 'MX' ? '#1a3a2a' : '#1a2a3a',
              color: s.market === 'MX' ? '#22c55e' : '#60a5fa',
              border: `1px solid ${s.market === 'MX' ? '#166534' : '#1e40af'}`,
              fontSize: 11
            }} className="px-2 py-0.5 rounded-full font-semibold">
              {s.market === 'MX' ? '🇲🇽 Bolsa Mexicana' : '🇺🇸 NYSE / NASDAQ'}
            </span>
            <span style={{ background: "#1a2235", color: "#94a3b8", fontSize: 11 }} className="px-2 py-0.5 rounded-full">
              vs {s.benchmark}
            </span>
            {s.badge && (
              <span style={{ background: "#f97316", fontSize: 10 }} className="px-2 py-0.5 rounded-full font-bold text-white">
                {s.badge}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{s.name}</h1>
          <p style={{ color: "#94a3b8" }} className="max-w-xl">{s.description}</p>
          <p style={{ color: "#64748b" }} className="text-sm mt-2">
            {s.stockCount} acciones · Rebalanceo: {s.rebalanceDay}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/pricing" style={{ background: "#f97316" }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Acceder a esta estrategia
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Rendimiento histórico (10 años)</h2>
        <MetricsGrid metrics={s.metrics} benchmark={s.benchmark} />
      </section>

      {/* Chart */}
      <section className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Evolución vs {s.benchmark}</h2>
          <span style={{ color: "#64748b" }} className="text-xs">Base 100 · Ene 2015 – May 2026</span>
        </div>
        <PerformanceChart data={s.performance} benchmark={s.benchmark} />
        <p style={{ color: "#475569" }} className="text-xs mt-3">
          Resultados de backtesting. La rentabilidad pasada no garantiza resultados futuros.
        </p>
      </section>

      {/* Stocks */}
      <section className="card overflow-hidden mb-8">
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">Portafolio actual</h2>
            <span style={{ background: "#1a3a2a", color: "#22c55e", border: "1px solid #166534", fontSize: 11 }}
              className="px-2 py-0.5 rounded-full font-semibold">
              Rebalanceado Jun 2026
            </span>
          </div>
          <p style={{ color: "#64748b" }} className="text-xs mb-4">
            {s.stockCount} acciones · Peso igual · Actualizado el primer día hábil del mes
          </p>
        </div>
        <StockTable stocks={s.stocks} />
      </section>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f2027 100%)", border: "1px solid #1e2d45", borderRadius: 12 }}
        className="p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Accede a todas las estrategias</h3>
        <p style={{ color: "#94a3b8" }} className="mb-6 max-w-md mx-auto">
          Obtén acceso completo a todas las estrategias, notificaciones de rebalanceo y más de 50 métricas por acción.
        </p>
        <Link href="/pricing" style={{ background: "#f97316" }}
          className="inline-block px-8 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity">
          Ver planes →
        </Link>
      </div>
    </div>
  );
}
