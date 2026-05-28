/**
 * GET /api/bmv/intradia?ticker=CEMEXCPO&from=2026-05-28&to=2026-05-28&intervalo=5m
 * Datos intradía con indicadores técnicos calculados
 * Fuente: DataBursatil
 * Cache: 60s
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getIntradiaPrecios,
  FMP_TO_DB,
  calcRSI,
  calcEMA,
  calcMACD,
  calcBollinger,
  generateSignal,
  type DBIntradiaInterval,
} from '@/lib/databursatil'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  let ticker    = searchParams.get('ticker') ?? 'CEMEXCPO'
  const intervalo = (searchParams.get('intervalo') ?? '5m') as DBIntradiaInterval
  const today   = new Date().toISOString().slice(0, 10)
  const from    = searchParams.get('from') ?? today
  const to      = searchParams.get('to')   ?? today
  const withIndicators = searchParams.get('indicators') !== 'false'

  // Normalizar ticker: FMP (.MX) → DataBursatil
  if (ticker.endsWith('.MX') && FMP_TO_DB[ticker]) {
    ticker = FMP_TO_DB[ticker]
  }

  try {
    const raw = await getIntradiaPrecios(ticker, from, to, intervalo)

    if (raw.length === 0) {
      return NextResponse.json(
        { error: `Sin datos intradía para ${ticker} (${from} - ${to})` },
        { status: 404 }
      )
    }

    const prices = raw.map(p => p.price)
    const times  = raw.map(p => p.time)

    // Calcular OHLC desde precios consecutivos
    const candles = raw.map((p, i) => {
      const prev = i > 0 ? raw[i - 1].price : p.price
      return {
        time:  p.time,
        open:  prev,
        high:  Math.max(prev, p.price),
        low:   Math.min(prev, p.price),
        close: p.price,
      }
    })

    if (!withIndicators) {
      return NextResponse.json({ ticker, candles })
    }

    // Indicadores técnicos
    const rsiArr     = calcRSI(prices, 14)
    const sma20      = calcEMA(prices, 20)
    const sma50      = calcEMA(prices, 50)
    const { macd, signal: macdSignal, histogram } = calcMACD(prices)
    const { upper: bbUpper, middle: bbMid, lower: bbLower } = calcBollinger(prices, 20, 2)
    const tradingSignal = generateSignal(prices)

    // Combinar en un array para el frontend
    const chartData = times.map((time, i) => ({
      time,
      close: prices[i],
      open:  candles[i].open,
      high:  candles[i].high,
      low:   candles[i].low,
      rsi:   rsiArr[i],
      sma20: sma20[i],
      sma50: sma50[i],
      macd:       macd[i],
      macdSignal: macdSignal[i],
      histogram:  histogram[i],
      bbUpper: bbUpper[i],
      bbMid:   bbMid[i],
      bbLower: bbLower[i],
    }))

    // Estadísticas del día
    const high  = Math.max(...prices)
    const low   = Math.min(...prices)
    const open  = prices[0]
    const close = prices[prices.length - 1]
    const pctChange = open > 0 ? ((close - open) / open) * 100 : 0

    return NextResponse.json({
      ticker,
      from,
      to,
      intervalo,
      points: raw.length,
      dayStats: {
        open,
        high,
        low,
        close,
        pctChange: Math.round(pctChange * 100) / 100,
        range: Math.round((high - low) * 100) / 100,
      },
      signal: tradingSignal,
      chartData,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })

  } catch (err) {
    console.error('Intraday error:', err)
    return NextResponse.json({ error: 'Error obteniendo datos intradía' }, { status: 500 })
  }
}
