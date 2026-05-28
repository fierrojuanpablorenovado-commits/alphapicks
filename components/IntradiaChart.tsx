'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ComposedChart, Line, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

type ChartPoint = {
  time: string; close: number; open: number; high: number; low: number
  rsi: number | null; sma20: number | null; sma50: number | null
  macd: number | null; macdSignal: number | null; histogram: number | null
  bbUpper: number | null; bbMid: number | null; bbLower: number | null
}
type DayStats = { open: number; high: number; low: number; close: number; pctChange: number; range: number }
type TradingSignal = {
  type: 'BUY' | 'SELL' | 'NEUTRAL'; strength: 'STRONG' | 'MODERATE' | 'WEAK'
  reason: string; rsi: number | null; macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; bbPosition: 'ABOVE' | 'INSIDE' | 'BELOW'
}
type IntradiaData = {
  ticker: string; from: string; to: string; intervalo: string; points: number
  dayStats: DayStats; signal: TradingSignal; chartData: ChartPoint[]
}
type Tab = 'precio' | 'rsi' | 'macd'

const IPC_TICKERS = [
  'CEMEXCPO','GMEXICOB','FEMSAUBD','WALMEX*','BIMBOA',
  'ASURB','GAPB','OMAB','GRUMAB','KOFUBL',
  'GCARSOA1','GFINBURO','CHDRAUIB','BOLSAA','BBAJIOO',
  'MEGACPO','LACOMERUBC','GENTERA*','ALSEA*','PINFRA*',
]

const TOOLTIP_STYLE = {
  background: "#06090F",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 11,
  fontFamily: "'Inter',sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
}

export default function IntradiaChart() {
  const [ticker,    setTicker]    = useState('CEMEXCPO')
  const [intervalo, setIntervalo] = useState<'1m' | '5m' | '1h'>('5m')
  const [data,      setData]      = useState<IntradiaData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState<Tab>('precio')
  const [lastAt,    setLastAt]    = useState<Date | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bmv/intradia?ticker=${ticker}&from=${today}&to=${today}&intervalo=${intervalo}`, { cache: 'no-store' })
      if (res.ok) { setData(await res.json()); setLastAt(new Date()) }
    } catch { /* silently fail */ } finally { setLoading(false) }
  }, [ticker, intervalo, today])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { const t = setInterval(fetchData, 60_000); return () => clearInterval(t) }, [fetchData])

  const fmt  = (t: string) => t.slice(11, 16)
  const up   = (data?.dayStats.pctChange ?? 0) >= 0
  const priceColor = up ? "#10B981" : "#EF4444"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Controls bar ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>

        {/* Ticker select */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
          background: "rgba(8,13,24,0.8)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10,
        }}>
          <span style={{ fontSize: 10, color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Emisora</span>
          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            style={{
              background: "transparent", color: "#F1F5F9",
              fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
              border: "none", outline: "none", cursor: "pointer", letterSpacing: "0.02em",
            }}
          >
            {IPC_TICKERS.map(t => (
              <option key={t} value={t} style={{ background: "#080D18" }}>{t.replace('*', '')}</option>
            ))}
          </select>
        </div>

        {/* Interval pills */}
        <div style={{ display: "flex", gap: 3, padding: 3, background: "rgba(8,13,24,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
          {(['1m', '5m', '1h'] as const).map(iv => (
            <button
              key={iv}
              onClick={() => setIntervalo(iv)}
              style={{
                padding: "5px 12px", borderRadius: 7,
                fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                color: intervalo === iv ? "#F1F5F9" : "#334155",
                background: intervalo === iv ? "rgba(99,102,241,0.2)" : "transparent",
                border: intervalo === iv ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.12s",
              }}
            >{iv}</button>
          ))}
        </div>

        {/* Chart type pills */}
        <div style={{ display: "flex", gap: 3, padding: 3, background: "rgba(8,13,24,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
          {([
            { id: 'precio' as Tab, label: 'Precio' },
            { id: 'rsi'    as Tab, label: 'RSI' },
            { id: 'macd'   as Tab, label: 'MACD' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "5px 12px", borderRadius: 7,
                fontSize: 12, fontWeight: 600,
                color: tab === t.id ? "#F1F5F9" : "#334155",
                background: tab === t.id ? "rgba(255,255,255,0.08)" : "transparent",
                border: tab === t.id ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.12s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchData}
          style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px",
            background: "rgba(8,13,24,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, color: "#334155", fontSize: 11, cursor: "pointer",
            transition: "color 0.1s, border-color 0.1s",
          }}
        >
          <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none", fontSize: 13 }}>↻</span>
          {lastAt ? lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : "—"}
        </button>
      </div>

      {/* ── Price stats bar ── */}
      {data && !loading && (
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16,
          padding: "14px 18px",
          background: "rgba(8,13,24,0.8)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
        }}>
          <span className="num" style={{ fontSize: 14, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.04em" }}>
            {ticker.replace('*', '')}
          </span>
          <span className="num" style={{ fontSize: 22, fontWeight: 800, color: priceColor, letterSpacing: "-0.03em" }}>
            ${data.dayStats.close.toFixed(2)}
          </span>
          <span className="num" style={{ fontSize: 13, fontWeight: 700, color: priceColor }}>
            {up ? "▲" : "▼"} {Math.abs(data.dayStats.pctChange).toFixed(2)}%
          </span>

          <div style={{ display: "flex", gap: 16, marginLeft: 4 }}>
            {[
              { label: "A",   val: `$${data.dayStats.open.toFixed(2)}`,  col: "#94A3B8" },
              { label: "Max", val: `$${data.dayStats.high.toFixed(2)}`,  col: "#10B981" },
              { label: "Min", val: `$${data.dayStats.low.toFixed(2)}`,   col: "#EF4444" },
              { label: "Rng", val: `$${data.dayStats.range.toFixed(2)}`, col: "#94A3B8" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 9, color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</span>
                <span className="num" style={{ fontSize: 12, fontWeight: 600, color: s.col }}>{s.val}</span>
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 9, color: "#334155", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Velas</span>
              <span className="num" style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{data.points}</span>
            </div>
          </div>

          <SignalBadge signal={data.signal} />
        </div>
      )}

      {/* ── Chart ── */}
      <div style={{
        background: "rgba(6,9,15,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "16px 4px 8px", height: 360,
      }}>
        {loading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.4)", borderTop: "2px solid #6366F1", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 11, color: "#334155" }}>Cargando datos...</span>
            </div>
          </div>
        ) : !data?.chartData?.length ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 24, opacity: 0.3 }}>📊</span>
            <span style={{ fontSize: 12, color: "#334155" }}>Sin datos disponibles para hoy</span>
            <span style={{ fontSize: 11, color: "#1E293B" }}>Mercado cerrado o sin operaciones en {ticker.replace('*','')}</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {tab === 'precio' ? (
              <ComposedChart data={data.chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="time" tickFormatter={fmt}
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}`} width={50}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  labelFormatter={t => typeof t === 'string' ? fmt(t) : String(t)}
                  formatter={(v, n) => [typeof v === 'number' ? `$${v.toFixed(2)}` : String(v), String(n)]}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: "#334155", paddingTop: 8 }} />
                <Line type="monotone" dataKey="bbUpper"  name="BB +" stroke="rgba(99,102,241,0.35)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="bbMid"    name="BB M"  stroke="rgba(99,102,241,0.2)" strokeWidth={1} dot={false} strokeDasharray="2 4" />
                <Line type="monotone" dataKey="bbLower"  name="BB -"  stroke="rgba(99,102,241,0.35)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="sma20"    name="SMA20" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeOpacity={0.8} />
                <Line type="monotone" dataKey="sma50"    name="SMA50" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeOpacity={0.8} />
                <Line type="monotone" dataKey="close"    name="Precio"
                  stroke={priceColor} strokeWidth={2.5} dot={false}
                  activeDot={{ r: 4, fill: priceColor, strokeWidth: 0 }}
                />
              </ComposedChart>
            ) : tab === 'rsi' ? (
              <ComposedChart data={data.chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" tickFormatter={fmt}
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis domain={[0, 100]} ticks={[0, 30, 50, 70, 100]}
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false} width={30}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  labelFormatter={t => typeof t === 'string' ? fmt(t) : String(t)}
                  formatter={v => [typeof v === 'number' ? v.toFixed(1) : String(v), 'RSI(14)']}
                />
                <ReferenceLine y={70} stroke="rgba(239,68,68,0.5)"  strokeDasharray="4 4" label={{ value: '70', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
                <ReferenceLine y={30} stroke="rgba(16,185,129,0.5)" strokeDasharray="4 4" label={{ value: '30', fill: '#10B981', fontSize: 9, position: 'right' }} />
                <Line type="monotone" dataKey="rsi" name="RSI"
                  stroke="#6366F1" strokeWidth={2.5} dot={false}
                  activeDot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={data.chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" tickFormatter={fmt}
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false}
                  interval={Math.floor(data.chartData.length / 8)}
                />
                <YAxis
                  tick={{ fill: "#1E293B", fontSize: 9, fontFamily: "'JetBrains Mono',monospace" }}
                  tickLine={false} axisLine={false} width={50}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  labelFormatter={t => typeof t === 'string' ? fmt(t) : String(t)}
                  formatter={(v, n) => [typeof v === 'number' ? v.toFixed(4) : String(v), String(n)]}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: "#334155", paddingTop: 8 }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                <Bar dataKey="histogram" name="Histo" fillOpacity={0.75} maxBarSize={6}>
                  {data.chartData.map((e, i) => (
                    <Cell key={i} fill={(e.histogram ?? 0) >= 0 ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="macd"       name="MACD"  stroke="#60A5FA" strokeWidth={2}   dot={false} />
                <Line type="monotone" dataKey="macdSignal" name="Señal" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Signal detail ── */}
      {data?.signal && !loading && (
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14,
          padding: "12px 18px", borderRadius: 12,
          background: data.signal.type === 'BUY'  ? "rgba(16,185,129,0.05)"
                    : data.signal.type === 'SELL' ? "rgba(239,68,68,0.05)"
                    : "rgba(8,13,24,0.8)",
          border: `1px solid ${
            data.signal.type === 'BUY'  ? "rgba(16,185,129,0.2)"
          : data.signal.type === 'SELL' ? "rgba(239,68,68,0.2)"
          : "rgba(255,255,255,0.07)"
          }`,
        }}>
          <span style={{ fontSize: 12, color: "#475569" }}>Señal IA:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>{data.signal.reason}</span>
          <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
            {[
              { label: "RSI",  val: data.signal.rsi?.toFixed(1) ?? "—" },
              { label: "MACD", val: data.signal.macdSignal,
                col: data.signal.macdSignal === 'BULLISH' ? "#10B981" : data.signal.macdSignal === 'BEARISH' ? "#EF4444" : "#475569" },
              { label: "BB",   val: data.signal.bbPosition },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
                <span className="num" style={{ fontSize: 11, fontWeight: 600, color: s.col ?? "#94A3B8" }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SignalBadge({ signal }: { signal: TradingSignal }) {
  const isBuy  = signal.type === 'BUY'
  const isSell = signal.type === 'SELL'
  const color  = isBuy ? "#10B981" : isSell ? "#EF4444" : "#475569"
  const bg     = isBuy ? "rgba(16,185,129,0.1)" : isSell ? "rgba(239,68,68,0.1)" : "rgba(71,85,105,0.2)"
  const brd    = isBuy ? "rgba(16,185,129,0.3)"  : isSell ? "rgba(239,68,68,0.3)"  : "rgba(71,85,105,0.3)"
  const dots   = { STRONG: "●●●", MODERATE: "●●○", WEAK: "●○○" }
  const labels = { BUY: "COMPRA", SELL: "VENTA", NEUTRAL: "NEUTRAL" }

  return (
    <div
      style={{
        marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 8,
        background: bg, border: `1px solid ${brd}`, color,
      }}
    >
      <span className="num" style={{ fontSize: 10, letterSpacing: "0.08em" }}>{dots[signal.strength]}</span>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
        {isBuy ? "▲ " : isSell ? "▼ " : "→ "}{labels[signal.type]}
      </span>
    </div>
  )
}
