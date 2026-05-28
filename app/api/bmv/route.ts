/**
 * GET /api/bmv
 * Cotizaciones en tiempo real de todas las emisoras IPC (BMV)
 * Fuente: DataBursatil (200k créditos/mes gratuitos)
 * Cache: 60 segundos
 */

import { NextResponse } from 'next/server'
import { getIPCQuotes, getDivisas } from '@/lib/databursatil'

// Forzar ejecución dinámica: esta ruta llama a DataBursatil en tiempo real
// Sin esto Next.js la pre-renderiza estáticamente en build time (token no disponible → datos vacíos)
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [quotes, divisas] = await Promise.all([
      getIPCQuotes(60),
      getDivisas(),
    ])

    // Estadísticas del mercado
    const active = quotes.filter(q => {
      const ts = new Date(q.timestamp).getTime()
      const hoursAgo = (Date.now() - ts) / 1000 / 3600
      return hoursAgo < 24 // activas en las últimas 24h
    })

    const gainers = active.filter(q => q.change > 0).sort((a, b) => b.change - a.change)
    const losers  = active.filter(q => q.change < 0).sort((a, b) => a.change - b.change)

    const marketStats = {
      totalActive: active.length,
      totalGainers: gainers.length,
      totalLosers: losers.length,
      avgChange: active.length
        ? active.reduce((s, q) => s + q.change, 0) / active.length
        : 0,
      topGainer: gainers[0] ?? null,
      topLoser: losers[0] ?? null,
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      quotes,
      marketStats,
      divisas,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('BMV API error:', err)
    return NextResponse.json({ error: 'Error obteniendo datos BMV' }, { status: 500 })
  }
}
