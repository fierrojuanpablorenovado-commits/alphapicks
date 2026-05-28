import { NextRequest, NextResponse } from 'next/server'
import { getProfile, getKeyMetrics, getRatios } from '@/lib/fmp'
import { scoreStocks, buildPortfolio } from '@/lib/scoring'
import {
  IPC_TICKERS, SP500_TOP100, TECH_TICKERS,
  VALUE_TICKERS, DOW30_TICKERS, MIDCAP_TICKERS
} from '@/lib/tickers'

const STRATEGY_CONFIG: Record<string, { tickers: string[]; portfolioSize: number }> = {
  'lideres-bmv':  { tickers: IPC_TICKERS,    portfolioSize: 15 },
  'beat-sp500':   { tickers: SP500_TOP100,   portfolioSize: 20 },
  'tech-titans':  { tickers: TECH_TICKERS,   portfolioSize: 15 },
  'top-value':    { tickers: VALUE_TICKERS,  portfolioSize: 15 },
  'mid-cap-movers': { tickers: MIDCAP_TICKERS, portfolioSize: 15 },
  'dominate-dow': { tickers: DOW30_TICKERS,  portfolioSize: 10 },
}

// Fetch data for one ticker — 3 API calls
async function fetchTicker(symbol: string) {
  const [profile, metrics, ratios] = await Promise.all([
    getProfile(symbol),
    getKeyMetrics(symbol),
    getRatios(symbol),
  ])
  if (!profile) return null
  return {
    symbol,
    companyName: profile.companyName,
    price: profile.price,
    marketCap: profile.marketCap,
    sector: profile.sector,
    currency: profile.currency,
    beta: profile.beta,
    peRatio:          metrics?.peRatio          ?? ratios?.priceToEarningsRatio ?? 0,
    pbRatio:          metrics?.pbRatio          ?? ratios?.priceToBookRatio     ?? 0,
    evToEbitda:       metrics?.evToEbitda       ?? 0,
    roe:              metrics?.roe              ?? ratios?.returnOnEquity       ?? 0,
    roa:              metrics?.roa              ?? ratios?.returnOnAssets       ?? 0,
    netProfitMargin:  ratios?.netProfitMargin   ?? 0,
    grossProfitMargin: ratios?.grossProfitMargin ?? 0,
    currentRatio:     metrics?.currentRatio     ?? ratios?.currentRatio        ?? 1,
    debtRatio:        metrics?.debtToEquity     ?? ratios?.debtRatio           ?? 0,
    dividendYield:    ratios?.dividendYield     ?? 0,
    freeCashFlowYield: metrics?.freeCashFlowYield ?? 0,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { strategy: string } }
) {
  const { strategy } = params
  const config = STRATEGY_CONFIG[strategy]

  if (!config) {
    return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
  }

  try {
    // Fetch data for all tickers in parallel (respetando rate limit con delays)
    const rawResults = await Promise.allSettled(
      config.tickers.map((ticker, i) =>
        new Promise<Awaited<ReturnType<typeof fetchTicker>>>(resolve =>
          setTimeout(() => fetchTicker(ticker).then(resolve), i * 120)
        )
      )
    )

    const validStocks = rawResults
      .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof fetchTicker>>>> =>
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value)

    if (validStocks.length === 0) {
      return NextResponse.json({ error: 'No data available' }, { status: 503 })
    }

    // Score and build portfolio
    const scored = scoreStocks(validStocks)
    const portfolio = buildPortfolio(scored, config.portfolioSize)
    const allScored = scored // include all for analytics

    return NextResponse.json({
      strategy,
      updatedAt: new Date().toISOString(),
      totalAnalyzed: validStocks.length,
      portfolio,
      allScored: allScored.slice(0, 50), // top 50 for display
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      }
    })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
