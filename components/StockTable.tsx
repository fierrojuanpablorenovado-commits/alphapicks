import type { Stock } from "@/lib/data";

type Props = { stocks: Stock[] };

export default function StockTable({ stocks }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #1e2d45", color: "#64748b" }}>
            <th className="text-left py-3 px-4 font-medium">Acción</th>
            <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Sector</th>
            <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Entrada</th>
            <th className="text-right py-3 px-4 font-medium hidden md:table-cell">Precio entrada</th>
            <th className="text-right py-3 px-4 font-medium">Precio actual</th>
            <th className="text-right py-3 px-4 font-medium">Retorno total</th>
            <th className="text-right py-3 px-4 font-medium hidden lg:table-cell">Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock, i) => (
            <tr key={stock.ticker}
              style={{ borderBottom: "1px solid #1e2d4533" }}
              className="hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div style={{ background: "#1a2235", color: "#f97316", minWidth: 36, fontWeight: 700, fontSize: 11 }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-center leading-tight">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{stock.ticker}</p>
                    <p style={{ color: "#64748b" }} className="text-xs truncate max-w-[140px]">{stock.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <span style={{ background: "#1a2235", color: "#94a3b8", fontSize: 11 }} className="px-2 py-1 rounded-md">
                  {stock.sector}
                </span>
              </td>
              <td className="py-3 px-4 hidden md:table-cell" style={{ color: "#64748b" }}>
                {new Date(stock.entryDate).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 px-4 text-right hidden md:table-cell" style={{ color: "#94a3b8" }}>
                ${stock.entryPrice.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right font-medium text-white">
                ${stock.currentPrice.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right font-bold text-green-400">
                +{stock.totalReturn.toFixed(1)}%
              </td>
              <td className="py-3 px-4 text-right hidden lg:table-cell" style={{ color: "#64748b" }}>
                {stock.marketCap}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
