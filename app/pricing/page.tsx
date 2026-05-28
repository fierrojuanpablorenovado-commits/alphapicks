
const plans = [
  {
    name: "Pro",
    price: 279,
    priceUSD: 14,
    period: "mes",
    originalPrice: 449,
    description: "Para inversores individuales",
    features: [
      "3 estrategias AlphaPicks",
      "Rebalanceo mensual automático",
      "Portafolio de 10-20 acciones c/u",
      "Gráficas de rendimiento",
      "Métricas: Sharpe, Sortino, Beta",
      "Notificaciones por email",
      "Historial 5 años",
    ],
    cta: "Comenzar con Pro",
    highlighted: false,
    color: "#3b82f6",
  },
  {
    name: "Pro+",
    price: 699,
    priceUSD: 35,
    period: "mes",
    originalPrice: 1299,
    description: "Para inversores serios",
    features: [
      "Todas las estrategias (6+)",
      "BMV + NYSE/NASDAQ",
      "Rebalanceo mensual automático",
      "Portafolios de 10-20 acciones",
      "Métricas completas de riesgo",
      "Notificaciones por email y WhatsApp",
      "Historial 10 años completo",
      "Acceso anticipado a nuevas estrategias",
      "Análisis por acción detallado",
    ],
    cta: "Comenzar con Pro+",
    highlighted: true,
    color: "#f97316",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Planes simples, resultados <span style={{ color: "#f97316" }}>extraordinarios</span>
        </h1>
        <p style={{ color: "#94a3b8" }} className="text-lg">
          Cancela cuando quieras. Sin contratos. Sin letra pequeña.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {plans.map(plan => (
          <div key={plan.name}
            style={{
              background: plan.highlighted ? "linear-gradient(135deg, #1a1a2e 0%, #0f2027 100%)" : "#111827",
              border: `2px solid ${plan.highlighted ? plan.color : "#1e2d45"}`,
              borderRadius: 16,
            }}
            className="p-6 flex flex-col relative">
            {plan.highlighted && (
              <div style={{ background: plan.color, top: -12, left: "50%", transform: "translateX(-50%)" }}
                className="absolute px-4 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap">
                MEJOR ELECCIÓN
              </div>
            )}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p style={{ color: "#64748b" }} className="text-sm">{plan.description}</p>
            </div>
            <div className="mb-5">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span style={{ color: "#64748b" }} className="text-sm mb-1">MXN/{plan.period}</span>
              </div>
              <p style={{ color: "#475569" }} className="text-xs mt-1">
                <span className="line-through">${plan.originalPrice} MXN</span>
                <span style={{ color: "#22c55e" }} className="ml-2 font-semibold">
                  AHORRA {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                </span>
              </p>
            </div>
            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#cbd5e1" }}>
                  <span style={{ color: plan.color }} className="mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button style={{ background: plan.highlighted ? plan.color : "transparent",
              border: `2px solid ${plan.highlighted ? "transparent" : plan.color}`,
              color: plan.highlighted ? "white" : plan.color }}
              className="w-full py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: "#111827", border: "1px solid #1e2d45", borderRadius: 10 }} className="p-4 text-center">
        <p style={{ color: "#475569" }} className="text-xs">
          Los resultados mostrados son de backtesting histórico y no garantizan rendimientos futuros.
          AlphaPicks no es un asesor financiero autorizado.
        </p>
      </div>
    </div>
  );
}
