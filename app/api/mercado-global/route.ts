/**
 * GET /api/mercado-global
 * Agrega en una sola llamada: índices globales + noticias + divisas + cotizaciones IPC
 * Cache: 60s
 */
import { NextResponse } from 'next/server'
import { getIndices, getNoticias, getDivisas, getIPCQuotes } from '@/lib/databursatil'

// Forzar ejecución dinámica: datos en tiempo real, no pre-renderizar en build
export const dynamic = 'force-dynamic'

export async function GET() {
  const [indices, noticias, divisas, quotes] = await Promise.all([
    getIndices(),
    getNoticias(),
    getDivisas(),
    getIPCQuotes(60),
  ])

  const ipcData = quotes.filter(q => {
    const ts = new Date(q.timestamp).getTime()
    return (Date.now() - ts) / 1000 / 3600 < 24
  })

  const gainers = [...ipcData].sort((a, b) => b.change - a.change).slice(0, 5)
  const losers  = [...ipcData].sort((a, b) => a.change - b.change).slice(0, 5)

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    indices,
    noticias: noticias.slice(0, 15),
    divisas,
    ipc: {
      quotes: ipcData,
      gainers,
      losers,
      stats: {
        total: ipcData.length,
        up:    ipcData.filter(q => q.change > 0).length,
        down:  ipcData.filter(q => q.change < 0).length,
        avg:   ipcData.length ? ipcData.reduce((s, q) => s + q.change, 0) / ipcData.length : 0,
      },
    },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
  })
}
