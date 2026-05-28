'use client'

import { useState } from 'react'
import { BMVMarketPanel } from '@/components/BMVTicker'
import IntradiaChart from '@/components/IntradiaChart'
import MercadoGlobal from '@/components/MercadoGlobal'
import AnimatedSection from '@/components/AnimatedSection'

type Tab = 'overview' | 'intradia' | 'bmv' | 'us'

export default function MercadoPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">En vivo</span>
            <span className="text-zinc-600 text-sm">·</span>
            <span className="text-zinc-500 text-sm">Sesión BMV: 08:30 – 15:00 CST</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Mercado en Tiempo Real</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl w-fit">
          {([
            { id: 'overview'  as Tab, label: '🌍 Mercado Global' },
            { id: 'intradia'  as Tab, label: '⚡ Intradía + IA' },
            { id: 'bmv'       as Tab, label: '🇲🇽 Tabla IPC' },
            { id: 'us'        as Tab, label: '🇺🇸 EE.UU.' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Mercado Global ── */}
        {tab === 'overview' && (
          <AnimatedSection>
            <MercadoGlobal />
          </AnimatedSection>
        )}

        {/* ── Tabla IPC ── */}
        {tab === 'bmv' && (
          <AnimatedSection>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-white">Emisoras IPC — BMV</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    Actualización automática cada 60 s · DataBursatil
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live feed
                </div>
              </div>
              <BMVMarketPanel />
            </div>
          </AnimatedSection>
        )}

        {/* ── Análisis Intradía ── */}
        {tab === 'intradia' && (
          <AnimatedSection>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Análisis Intradía con IA</h2>
                <p className="text-zinc-500 text-sm mt-0.5">
                  Candlestick · Bollinger Bands · RSI · MACD · Señales automáticas
                </p>
              </div>
              <IntradiaChart />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                {
                  icon: '📊',
                  title: 'Precios minuto a minuto',
                  desc: 'Datos 1m, 5m y 1h en tiempo real durante la sesión bursátil de BMV (8:30-15:00 CST).',
                },
                {
                  icon: '🤖',
                  title: 'Señales RSI + MACD + BB',
                  desc: 'El modelo combina tres indicadores técnicos para detectar zonas de compra/venta con nivel de confianza.',
                },
                {
                  icon: '⚡',
                  title: 'Cache 60 segundos',
                  desc: 'Los datos se actualizan automáticamente. Refresca manualmente en cualquier momento.',
                },
              ].map(card => (
                <div key={card.title} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{card.title}</h3>
                  <p className="text-zinc-500 text-xs">{card.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* ── EE.UU. — Coming soon ── */}
        {tab === 'us' && (
          <AnimatedSection>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-14 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">S&P 500 en Tiempo Real</h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm">
                Datos intradía del mercado americano via Polygon.io WebSocket.
                Candlestick + indicadores + señales. Disponible en plan Pro+.
              </p>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-lg text-sm">
                En desarrollo · Q3 2025
              </div>
            </div>
          </AnimatedSection>
        )}

      </div>
    </div>
  )
}
