'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type Indice = {
  symbol: string; flag: string; region: string; e: string
  u: number; c: number; ytdp: number; f: string
}
type Quote = {
  symbol: string; fmpSymbol: string; price: number
  change: number; changeAbs: number; volume: number; timestamp: string
}
type Noticia = { titulo: string; subtitulo?: string; enlace?: string; fecha?: string; emisora?: string }
type Divisas = { USDMXN?: { u: number; c: number }; EURMXN?: { u: number; c: number }; EURUSD?: { u: number; c: number } }
type MercadoData = {
  updatedAt: string
  indices: Indice[]
  noticias: Noticia[]
  divisas: Divisas
  ipc: {
    quotes: Quote[]
    gainers: Quote[]
    losers:  Quote[]
    stats: { total: number; up: number; down: number; avg: number }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MercadoGlobal() {
  const [data, setData]       = useState<MercadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastAt, setLastAt]   = useState<Date | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/mercado-global', { cache: 'no-store' })
      if (r.ok) { setData(await r.json()); setLastAt(new Date()) }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => {
    const t = setInterval(fetch_, 60_000)
    return () => clearInterval(t)
  }, [fetch_])

  if (loading) return <SkeletonLoader />
  if (!data) return <div className="text-zinc-500 text-sm p-8 text-center">Error cargando datos</div>

  const ipcIndice = data.indices.find(i => i.symbol === 'IPC')

  return (
    <div className="space-y-5">
      {/* ── Fila 1: Índices globales ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-zinc-200">Índices Globales</h2>
          {lastAt && (
            <span className="text-xs text-zinc-600">
              Actualizado {lastAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              <button onClick={fetch_} className="ml-2 text-zinc-500 hover:text-white transition-colors">↻</button>
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {data.indices.map(idx => <IndiceCard key={idx.symbol} idx={idx} />)}
        </div>
      </section>

      {/* ── Fila 2: IPC resumen + Divisas + Mapa de calor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* IPC Stats */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🇲🇽</span>
            <div>
              <h3 className="font-semibold text-white text-sm">IPC — Bolsa Mexicana</h3>
              <p className="text-zinc-500 text-xs">Sesión 08:30–15:00 CST</p>
            </div>
          </div>
          {ipcIndice && (
            <div className="mb-4">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {ipcIndice.u.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </span>
                <span className={`font-mono text-sm font-semibold mb-0.5 ${ipcIndice.c >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ipcIndice.c >= 0 ? '▲' : '▼'} {Math.abs(ipcIndice.c).toFixed(2)}%
                </span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">YTD: <span className="text-emerald-400 font-mono">+{ipcIndice.ytdp.toFixed(2)}%</span></p>
            </div>
          )}
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-900 rounded-lg p-2">
              <div className="text-emerald-400 font-mono font-bold">{data.ipc.stats.up}</div>
              <div className="text-zinc-600 text-xs">Alzas</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2">
              <div className="text-red-400 font-mono font-bold">{data.ipc.stats.down}</div>
              <div className="text-zinc-600 text-xs">Bajas</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-2">
              <div className={`font-mono font-bold text-sm ${data.ipc.stats.avg >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.ipc.stats.avg >= 0 ? '+' : ''}{data.ipc.stats.avg.toFixed(2)}%
              </div>
              <div className="text-zinc-600 text-xs">Prom.</div>
            </div>
          </div>
        </div>

        {/* Divisas */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5">
          <h3 className="font-semibold text-zinc-200 text-sm mb-4">Tipos de Cambio</h3>
          <div className="space-y-3">
            {[
              { pair: 'USD / MXN', val: data.divisas?.USDMXN, decimals: 4 },
              { pair: 'EUR / MXN', val: data.divisas?.EURMXN, decimals: 4 },
              { pair: 'EUR / USD', val: data.divisas?.EURUSD, decimals: 4 },
            ].map(fx => (
              <div key={fx.pair} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
                <span className="text-zinc-400 text-sm font-mono">{fx.pair}</span>
                <div className="text-right">
                  <div className="text-white font-mono font-semibold text-sm">
                    {fx.val?.u.toFixed(fx.decimals) ?? '—'}
                  </div>
                  <div className={`text-xs font-mono ${(fx.val?.c ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fx.val ? `${fx.val.c >= 0 ? '+' : ''}${fx.val.c.toFixed(2)}%` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-700 text-xs mt-3 text-right">Fuente: DataBursatil</p>
        </div>

        {/* Gainers/Losers */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5">
          <h3 className="font-semibold text-zinc-200 text-sm mb-4">Top Movimientos IPC</h3>
          <div className="space-y-1.5">
            {data.ipc.gainers.slice(0, 3).map(q => (
              <MiniQuoteRow key={q.symbol} q={q} dir="up" />
            ))}
            <div className="border-t border-zinc-800/60 my-2" />
            {data.ipc.losers.slice(0, 3).map(q => (
              <MiniQuoteRow key={q.symbol} q={q} dir="down" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila 3: Mapa de calor BMV ── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200 mb-3">Mapa de Calor — IPC</h2>
        <HeatMap quotes={data.ipc.quotes} />
      </section>

      {/* ── Fila 4: Noticias ── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200 mb-3">
          Noticias Financieras BMV
          <span className="ml-2 text-xs font-normal text-zinc-500">{data.noticias.length} noticias</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.noticias.slice(0, 9).map((n, i) => (
            <NoticiaCard key={i} n={n} />
          ))}
        </div>
      </section>

      {/* ── Fila 5: YTD comparativa ── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200 mb-3">Rendimiento YTD por Índice</h2>
        <YTDChart indices={data.indices} />
      </section>
    </div>
  )
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function IndiceCard({ idx }: { idx: Indice }) {
  const up = idx.c >= 0
  return (
    <div className={`rounded-xl p-3 border transition-colors cursor-default ${
      up
        ? 'bg-emerald-950/30 border-emerald-900/40 hover:bg-emerald-950/50'
        : 'bg-red-950/30 border-red-900/40 hover:bg-red-950/50'
    }`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{idx.flag}</span>
        <span className="text-zinc-400 text-xs font-mono font-medium">{idx.symbol}</span>
      </div>
      <div className="text-white font-mono font-bold text-sm truncate">
        {idx.u.toLocaleString('es-MX', { maximumFractionDigits: 2 })}
      </div>
      <div className={`text-xs font-mono font-semibold mt-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
        {up ? '+' : ''}{idx.c.toFixed(2)}%
      </div>
      <div className="text-zinc-600 text-xs mt-1 truncate">YTD {idx.ytdp >= 0 ? '+' : ''}{idx.ytdp.toFixed(1)}%</div>
    </div>
  )
}

function MiniQuoteRow({ q, dir }: { q: Quote; dir: 'up' | 'down' }) {
  const label = q.fmpSymbol.replace('.MX', '')
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-zinc-300 font-medium w-24 truncate">{label}</span>
      <span className="font-mono text-xs text-zinc-400">${q.price.toFixed(2)}</span>
      <span className={`font-mono text-xs font-semibold ${dir === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
        {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}%
      </span>
    </div>
  )
}

function HeatMap({ quotes }: { quotes: Quote[] }) {
  const active = quotes
    .filter(q => {
      const ts = new Date(q.timestamp).getTime()
      return (Date.now() - ts) / 1000 / 3600 < 24
    })
    .sort((a, b) => b.volume - a.volume) // Sort by volume (bigger = more visible)

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map(q => {
        const abs = Math.abs(q.change)
        const label = q.fmpSymbol.replace('.MX', '')
        // Color intensity based on change magnitude
        const intensity = Math.min(abs / 3, 1) // Max at 3% change
        const bg = q.change > 0
          ? `rgba(52,211,153,${0.08 + intensity * 0.35})`
          : q.change < 0
            ? `rgba(248,113,113,${0.08 + intensity * 0.35})`
            : 'rgba(63,63,70,0.4)'
        const border = q.change > 0
          ? `rgba(52,211,153,${0.2 + intensity * 0.4})`
          : q.change < 0
            ? `rgba(248,113,113,${0.2 + intensity * 0.4})`
            : 'rgba(63,63,70,0.6)'
        // Size based on volume rank
        const rank = active.indexOf(q)
        const size = rank < 5 ? 'w-28' : rank < 12 ? 'w-24' : 'w-20'

        return (
          <div
            key={q.symbol}
            className={`${size} rounded-xl p-2.5 border cursor-default transition-transform hover:scale-105`}
            style={{ background: bg, borderColor: border }}
            title={`${label}: $${q.price.toFixed(2)} (${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)}%)`}
          >
            <div className="text-xs font-mono font-bold text-zinc-200 truncate">{label}</div>
            <div className={`text-xs font-mono font-semibold mt-0.5 ${
              q.change > 0 ? 'text-emerald-300' : q.change < 0 ? 'text-red-300' : 'text-zinc-400'
            }`}>
              {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}%
            </div>
            <div className="text-zinc-500 text-[10px] mt-0.5 font-mono">${q.price.toFixed(2)}</div>
          </div>
        )
      })}
    </div>
  )
}

function NoticiaCard({ n }: { n: Noticia }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      {n.emisora && (
        <span className="inline-block text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full mb-2">
          {n.emisora}
        </span>
      )}
      <p className="text-zinc-200 text-xs font-medium leading-relaxed line-clamp-3">{n.titulo}</p>
      {n.subtitulo && (
        <p className="text-zinc-500 text-[11px] mt-1.5 line-clamp-2">{n.subtitulo}</p>
      )}
      {n.fecha && (
        <p className="text-zinc-700 text-[10px] mt-2">{n.fecha}</p>
      )}
    </div>
  )
}

function YTDChart({ indices }: { indices: Indice[] }) {
  const data = indices
    .filter(i => i.symbol !== 'VIX' && i.symbol !== 'FTSEBIVA')
    .sort((a, b) => b.ytdp - a.ytdp)
    .map(i => ({ name: i.symbol, ytd: i.ytdp, flag: i.flag }))

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-5" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
            width={45}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(2)}%` : String(v), 'YTD']}
          />
          <Bar dataKey="ytd" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.ytd >= 0 ? '#34d399' : '#f87171'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-6 gap-2">
        {[...Array(12)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-20" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-2xl h-48" />)}
      </div>
      <div className="bg-zinc-900 rounded-xl h-32" />
    </div>
  )
}
