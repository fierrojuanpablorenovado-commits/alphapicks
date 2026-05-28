import Link from "next/link";
import type { Strategy } from "@/lib/data";

type Props = { strategy: Strategy };

export default function StrategyCard({ strategy: s }: Props) {
  return (
    <Link href={`/estrategias/${s.slug}`}
      className="card p-5 flex flex-col gap-4 hover:border-orange-500/50 transition-all hover:-translate-y-0.5 cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span style={{
              background: s.market === 'MX' ? '#1a3a2a' : '#1a2a3a',
              color: s.market === 'MX' ? '#22c55e' : '#60a5fa',
              border: `1px solid ${s.market === 'MX' ? '#166534' : '#1e40af'}`,
              fontSize: 11
            }} className="px-2 py-0.5 rounded-full font-semibold">
              {s.market === 'MX' ? '🇲🇽 BMV' : '🇺🇸 NYSE/NASDAQ'}
            </span>
            {s.badge && (
              <span style={{ background: "#f97316", fontSize: 10 }} className="px-2 py-0.5 rounded-full font-bold text-white">
                {s.badge}
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-base leading-tight">{s.name}</h3>
          <p style={{ color: "#64748b" }} className="text-xs mt-1 line-clamp-2">{s.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="card2 p-3">
          <p style={{ color: "#64748b" }} className="text-xs mb-1">Retorno total (10a)</p>
          <p className="text-green-400 font-bold text-xl">+{s.metrics.totalReturn.toFixed(1)}%</p>
        </div>
        <div className="card2 p-3">
          <p style={{ color: "#64748b" }} className="text-xs mb-1">Retorno anualizado</p>
          <p className="text-white font-bold text-xl">+{s.metrics.annualizedReturn.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs" style={{ color: "#64748b" }}>
          <span>{s.stockCount} acciones</span>
          <span>·</span>
          <span>vs {s.benchmark}: <span className="text-green-400">+{s.metrics.vsIndex.toFixed(1)}%</span></span>
        </div>
        <span style={{ color: "#f97316" }} className="text-xs font-medium">Ver estrategia →</span>
      </div>
    </Link>
  );
}
