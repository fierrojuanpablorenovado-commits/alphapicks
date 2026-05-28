import type { StrategyMetrics } from "@/lib/data";

type Props = { metrics: StrategyMetrics; benchmark: string };

export default function MetricsGrid({ metrics, benchmark }: Props) {
  const items = [
    { label: "Retorno Total", value: `+${metrics.totalReturn.toFixed(1)}%`, positive: true, big: true },
    { label: "Retorno Anualizado", value: `+${metrics.annualizedReturn.toFixed(1)}%`, positive: true, big: true },
    { label: `vs ${benchmark}`, value: `+${metrics.vsIndex.toFixed(1)}%`, positive: true, big: false },
    { label: "Ratio de Sharpe", value: metrics.sharpeRatio.toFixed(2), positive: null, big: false },
    { label: "Ratio de Sortino", value: metrics.sortinoRatio.toFixed(2), positive: null, big: false },
    { label: "Beta", value: metrics.beta.toFixed(2), positive: null, big: false },
    { label: "Max Drawdown", value: `${metrics.maxDrawdown.toFixed(1)}%`, positive: false, big: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ label, value, positive, big }) => (
        <div key={label} className="card2 p-4">
          <p style={{ color: "#64748b" }} className="text-xs mb-1">{label}</p>
          <p className={`font-bold ${big ? "text-2xl" : "text-lg"} ${
            positive === true ? "text-green-400" :
            positive === false ? "text-red-400" :
            "text-white"
          }`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
