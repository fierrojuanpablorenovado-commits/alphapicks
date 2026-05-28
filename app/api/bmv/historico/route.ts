/**
 * GET /api/bmv/historico?ticker=AMXL&from=2024-01-01&to=2024-12-31
 * Precios históricos EOD de una emisora BMV
 * Fuente: DataBursatil
 * Cache: 24h (datos de cierre no cambian)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getHistorico, FMP_TO_DB } from '@/lib/databursatil'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Acepta ticker en formato FMP (.MX) o DataBursatil nativo
  let ticker = searchParams.get('ticker') ?? ''
  const from  = searchParams.get('from')   ?? getDefaultFrom()
  const to    = searchParams.get('to')     ?? new Date().toISOString().slice(0, 10)

  if (!ticker) {
    return NextResponse.json({ error: 'Parámetro ticker requerido' }, { status: 400 })
  }

  // Convertir formato FMP → DataBursatil si aplica
  if (ticker.endsWith('.MX') && FMP_TO_DB[ticker]) {
    ticker = FMP_TO_DB[ticker]
  }

  try {
    const historico = await getHistorico(ticker, from, to)

    if (historico.length === 0) {
      return NextResponse.json(
        { error: `No hay datos históricos para ${ticker} en el rango ${from} - ${to}` },
        { status: 404 }
      )
    }

    // Calcular estadísticas adicionales
    const prices = historico.map(h => h.price)
    const first = prices[0]
    const last  = prices[prices.length - 1]
    const high  = Math.max(...prices)
    const low   = Math.min(...prices)
    const totalReturn = first > 0 ? ((last - first) / first) * 100 : 0

    return NextResponse.json({
      ticker,
      from,
      to,
      days: historico.length,
      stats: {
        firstPrice: first,
        lastPrice: last,
        high,
        low,
        totalReturn: Math.round(totalReturn * 100) / 100,
      },
      data: historico,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    console.error('Historico error:', err)
    return NextResponse.json({ error: 'Error obteniendo histórico' }, { status: 500 })
  }
}

function getDefaultFrom(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().slice(0, 10)
}
