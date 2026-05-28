'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

type ChartPoint = {
  time: string
  close: number
  open: number
  high: number
  low: number
  rsi: number | null
  sma20: number | null
  sma50: number | null
  macd: number | null
  macdSignal: number | null
  histogram: number | null
  bbUpper: number | null
  bbMid: number | null
  bbLower: number | null
}

type DayStats = {
  open: number
  high: number
  low: number
  close: number
  pctChange: number
  range: number
}

type TradingSignal = {
  type: 'BUY' | 'SELL' | 'NEUTRAL'
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  reason: string
  rsi: number | null
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  bbPosition: 'ABOVE' | 'INSIDE' | 'BELOW'
}

type IntradiaData = {
  ticker: string
  from: string
  to: string
  intervalo: string
  points: number
  dayStats: DayStats
  signal: TradingSignal
  chartData: ChartPoint[]
}

type Tab = 'precio' | 'rsi' | 'macd'

// Tickers disponibles del IPC
const IPC_TICKERS = [
  'CEMEXCPO', 'GMEXICOB', 'FEMSAUBD', 'WALMEX*', 'BIMBOA',
  'ASURB', 'GAPB', 'OMAB', 'GRUMAB', 'KOFUBL',
  'GCARSOA1', 'GFINBURO', 'CHDRAUIB', 'BOLSAA', 'BBAJIOO',
  'MEGACPO', 'LACOMERUBC', 'GENTERA*', 'ALSEA*', 'PINFRA*',
]

export default function IntradiaChart() {
  const [ticker, setTicker]   = useState('CEMEXCPO')
  const [interval, setIntervalo] = useState<'1m' | '5m' | '1h'>('5m')
  const [data, setData]       = useState<IntradiaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('precio')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/bmv/intradia?ticker=${ticker}&from=${today}&to=${today}&intervalo=${interval}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        setData(await res.json())
        setLastRefresh(new Date())
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [ticker, interval, today])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh cada 60s
  useEffect(() => {
    const t = setInterval(fetchData, 60_000)
    return () => clearInterval(t)
  }, [fetchData])

  const formatTime = (t: string) => t.slice(11, 16) // HH:MM

  const up = (data?.dayStats.pctChange ?? 0) >= 0

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Ticker selector */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <span className="text-zinc-500 text-xs">Emisora</span>
          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            className="bg-transparent text-white text-sm font-mono font-semibold focus:outline-none cursor-pointer"
          >
            {IPC_TICKERS.map(t => (
              <option key={t} value={t} className="bg-zinc-900">
                {t.replace('*', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Interval selector */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {(['1m', '5m', '1h'] as const).map(iv => (
            <button
              key={iv}
              onClick={() => setIntervalo(iv)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                interval === iv
                  ? 'bg-orange-500 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {([
            { id: 'precio' as Tab, label: 'Precio + BB' },
            { id: 'rsi'    as Tab, label: 'RSI' },
            { id: 'macd'   as Tab, label: 'MACD' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchData}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white text-xs transition-colors"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          {lastRefresh ? lastRefresh.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—'}
        </button>
      </div>

      {/* Stats bar */}
      {data && !loading && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <span className="font-mono font-bold text-white text-lg">
            {ticker.replace('*', '')}
          </span>
          <span className={`font-mono font-bold text-xl ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            ${data.dayStats.close.toFixed(2)}
          </span>
          <span className={`font-mono text-sm font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? '▲' : '▼'} {Math.abs(data.dayStats.pctChange).toFixed(2)}%
          </span>
          <div className="flex items-center gap-3 text-xs text-zinc-500 ml-2">
            <span>A: <span className="text-zinc-300">${data.dayStats.open.toFixed(2)}</span></span>
            <span>Max: <span className="text-emerald-400">${data.dayStats.high.toFixed(2)}</span></span>
            <span>Min: <span className="text-red-400">${data.dayStats.low.toFixed(2)}</span></span>
            <span>Rango: <span className="text-zinc-300">${data.dayStats.range.toFixed(2)}</span></span>
            <span className="text-zinc-600">·</span>
            <span>{data.points} velas</span>
          </div>

          {/* Señal IA */}
          <SignalBadge signal={data.signal} />
        </div>
      )}

      {/* Chart */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4" style={{ height: 340 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-zinc-600 text-sm animate-pulse">Cargando datos...</div>
          </div>
        ) : !data?.chartData?.length ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-zinc-600 text-sm">Sin datos disponibles</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'precio' ? (
              <ComposedChart data={data.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${v}`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={(t) => typeof t === 'string' ? formatTime(t) : String(t)}
                  formatter={(v, name) => [typeof v === 'number' ? `$${v.toFixed(2)}` : String(v), String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                {/* Bollinger Bands */}
                <Line type="monotone" dataKey="bbUpper"  name="BB Superior" stroke="#374151" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="bbMid"    name="BB Media"    stroke="#4b5563" strokeWidth={1} dot={false} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="bbLower"  name="BB Inferior" stroke="#374151" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                {/* SMAs */}
                <Line type="monotone" dataKey="sma20"    name="SMA 20" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="sma50"    name="SMA 50" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                {/* Precio */}
                <Line
                  type="monotone" dataKey="close" name="Precio"
                  stroke={up ? '#34d399' : '#f87171'}
                  strokeWidth={2} dot={false}
                  activeDot={{ r: 3, fill: up ? '#34d399' : '#f87171' }}
                />
              </ComposedChart>
            ) : tab === 'rsi' ? (
              <ComposedChart data={data.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 30, 50, 70, 100]}
                  width={35}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={(t) => typeof t === 'string' ? formatTime(t) : String(t)}
                  formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : String(v), 'RSI']}
                />
                {/* Zonas de referencia */}
                <ReferenceLine y={70} stroke="#f87171" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: 'Sobrecompra', fill: '#f87171', fontSize: 9 }} />
                <ReferenceLine y={30} stroke="#34d399" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: 'Sobreventa', fill: '#34d399', fontSize: 9 }} />
                <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="2 2" strokeOpacity={0.4} />
                <Line
                  type="monotone" dataKey="rsi" name="RSI(14)"
                  stroke="#f97316" strokeWidth={2} dot={false}
                  activeDot={{ r: 3 }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={data.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={(t) => typeof t === 'string' ? formatTime(t) : String(t)}
                  formatter={(v, name) => [typeof v === 'number' ? v.toFixed(4) : String(v), String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <ReferenceLine y={0} stroke="#4b5563" strokeOpacity={0.6} />
                <Bar dataKey="histogram" name="Histograma" fill="#6b7280"
                  shape={(props: any) => {
                    const { x, y, width, height, value } = props
                    const fill = value >= 0 ? '#34d399' : '#f87171'
                    return <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.7} />
                  }}
                />
                <Line type="monotone" dataKey="macd"       name="MACD"    stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="macdSignal" name="Señal"   stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Signal detail */}
      {data?.signal && !loading && (
        <div className={`border rounded-xl px-4 py-3 text-sm flex flex-wrap items-center gap-4 ${
          data.signal.type === 'BUY'  ? 'bg-emerald-500/5 border-emerald-500/20' :
          data.signal.type === 'SELL' ? 'bg-red-500/5 border-red-500/20' :
          'bg-zinc-900/60 border-zinc-800/60'
        }`}>
          <span className="text-zinc-400">Señal IA:</span>
          <span className="font-semibold text-zinc-200">{data.signal.reason}</span>
          <div className="flex gap-3 text-xs ml-auto flex-wrap">
            <span className="text-zinc-500">RSI: <span className="text-zinc-300 font-mono">{data.signal.rsi?.toFixed(1) ?? '—'}</span></span>
            <span className="text-zinc-500">MACD: <span className={data.signal.macdSignal === 'BULLISH' ? 'text-emerald-400' : data.signal.macdSignal === 'BEARISH' ? 'text-red-400' : 'text-zinc-400'}>{data.signal.macdSignal}</span></span>
            <span className="text-zinc-500">BB: <span className="text-zinc-300">{data.signal.bbPosition}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Badge de señal ────────────────────────────────────────────────────────────

function SignalBadge({ signal }: { signal: TradingSignal }) {
  const colors = {
    BUY:     { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
    SELL:    { bg: 'bg-red-500/10 border-red-500/30',         text: 'text-red-400' },
    NEUTRAL: { bg: 'bg-zinc-800/60 border-zinc-700',          text: 'text-zinc-400' },
  }
  const strengthLabel = { STRONG: '●●●', MODERATE: '●●○', WEAK: '●○○' }
  const c = colors[signal.type]

  return (
    <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${c.bg} ${c.text}`}>
      <span className="font-mono">{strengthLabel[signal.strength]}</span>
      <span>{signal.type === 'BUY' ? '▲ COMPRA' : signal.type === 'SELL' ? '▼ VENTA' : '→ NEUTRAL'}</span>
    </div>
  )
}
