'use client'

import { useEffect, useState, useCallback } from 'react'

type Quote = {
  symbol: string
  fmpSymbol: string
  price: number
  change: number
  changeAbs: number
  volume: number
  timestamp: string
}

type MarketStats = {
  totalActive: number
  totalGainers: number
  totalLosers: number
  avgChange: number
  topGainer: Quote | null
  topLoser: Quote | null
}

type BMVData = {
  updatedAt: string
  quotes: Quote[]
  marketStats: MarketStats
  divisas?: {
    USDMXN?: { u: number; c: number }
  }
}

// ─── Ticker scrolling banner ────────────────────────────────────────────────────
export function BMVTickerBanner() {
  const [data, setData] = useState<BMVData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/bmv', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Actualizar cada 60 segundos durante sesión
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="bg-zinc-900 border-b border-zinc-800 h-9 flex items-center px-4">
        <span className="text-zinc-500 text-xs animate-pulse">Cargando datos BMV...</span>
      </div>
    )
  }

  if (!data?.quotes?.length) return null

  const active = data.quotes.filter(q => {
    const ts = new Date(q.timestamp).getTime()
    return (Date.now() - ts) / 1000 / 3600 < 24
  })

  const usdmxn = data.divisas?.USDMXN

  return (
    <div className="bg-zinc-950 border-b border-zinc-800/60 overflow-hidden h-8 flex items-center">
      {/* USD/MXN fijo a la izquierda */}
      {usdmxn && (
        <div className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-zinc-800 h-full bg-zinc-900/80">
          <span className="text-zinc-400 text-[11px] font-mono">USD/MXN</span>
          <span className="text-white text-[11px] font-mono font-semibold">
            {usdmxn.u.toFixed(4)}
          </span>
          <span className={`text-[10px] font-mono ${usdmxn.c >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {usdmxn.c >= 0 ? '+' : ''}{usdmxn.c.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Ticker scrolling */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex gap-6 items-center whitespace-nowrap"
          style={{
            animation: `scroll-ticker ${active.length * 4}s linear infinite`,
          }}
        >
          {[...active, ...active].map((q, i) => {
            const up = q.change >= 0
            // Strip .MX suffix for display
            const label = q.fmpSymbol.replace('.MX', '').replace('*', '')
            return (
              <span key={`${q.symbol}-${i}`} className="inline-flex items-center gap-1.5 text-[11px]">
                <span className="text-zinc-300 font-medium font-mono">{label}</span>
                <span className="text-zinc-200 font-mono">{q.price.toFixed(2)}</span>
                <span className={`font-mono ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(q.change).toFixed(2)}%
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── Panel de mercado completo ─────────────────────────────────────────────────
export function BMVMarketPanel() {
  const [data, setData] = useState<BMVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/bmv', { cache: 'no-store' })
      if (res.ok) {
        setData(await res.json())
        setLastRefresh(new Date())
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl h-20" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const { marketStats, divisas, quotes } = data
  const usdmxn = divisas?.USDMXN

  const active = quotes.filter(q => {
    const ts = new Date(q.timestamp).getTime()
    return (Date.now() - ts) / 1000 / 3600 < 24
  }).sort((a, b) => b.change - a.change)

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Emisoras activas"
          value={String(marketStats.totalActive)}
          sub={`${marketStats.totalGainers} alzas · ${marketStats.totalLosers} bajas`}
          color="zinc"
        />
        <StatCard
          label="Tendencia IPC"
          value={`${marketStats.avgChange >= 0 ? '+' : ''}${marketStats.avgChange.toFixed(2)}%`}
          sub="Promedio del día"
          color={marketStats.avgChange >= 0 ? 'emerald' : 'red'}
        />
        {marketStats.topGainer && (
          <StatCard
            label="Mayor alza"
            value={`+${marketStats.topGainer.change.toFixed(2)}%`}
            sub={marketStats.topGainer.fmpSymbol.replace('.MX', '')}
            color="emerald"
          />
        )}
        {usdmxn && (
          <StatCard
            label="USD/MXN"
            value={usdmxn.u.toFixed(4)}
            sub={`${usdmxn.c >= 0 ? '+' : ''}${usdmxn.c.toFixed(2)}% hoy`}
            color={usdmxn.c >= 0 ? 'emerald' : 'red'}
          />
        )}
      </div>

      {/* Quotes table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-2 px-3 text-zinc-500 font-medium text-xs">Emisora</th>
              <th className="text-right py-2 px-3 text-zinc-500 font-medium text-xs">Precio</th>
              <th className="text-right py-2 px-3 text-zinc-500 font-medium text-xs">Cambio %</th>
              <th className="text-right py-2 px-3 text-zinc-500 font-medium text-xs hidden sm:table-cell">Cambio $</th>
              <th className="text-right py-2 px-3 text-zinc-500 font-medium text-xs hidden md:table-cell">Volumen</th>
            </tr>
          </thead>
          <tbody>
            {active.map(q => {
              const up = q.change >= 0
              const label = q.fmpSymbol.replace('.MX', '')
              return (
                <tr key={q.symbol} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-zinc-200 text-xs">{label}</td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-200 text-xs">
                    ${q.price.toFixed(2)}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {up ? '+' : ''}{q.change.toFixed(2)}%
                  </td>
                  <td className={`py-2 px-3 text-right font-mono text-xs hidden sm:table-cell ${up ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                    {up ? '+' : ''}{q.changeAbs.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-zinc-500 text-xs hidden md:table-cell">
                    {formatVolume(q.volume)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {lastRefresh && (
        <p className="text-zinc-600 text-xs text-right">
          Actualizado {lastRefresh.toLocaleTimeString('es-MX')} · Fuente: DataBursatil (BMV)
        </p>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: {
  label: string
  value: string
  sub: string
  color: 'zinc' | 'emerald' | 'red'
}) {
  const colors = {
    zinc:    'text-zinc-200',
    emerald: 'text-emerald-400',
    red:     'text-red-400',
  }
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      <p className={`text-base font-bold font-mono ${colors[color]}`}>{value}</p>
      <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>
    </div>
  )
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}
