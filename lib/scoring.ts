/**
 * AlphaPicks Factor Scoring Model
 * Replica la metodología de ProPicks:
 * - 4 factores: Value, Quality, Momentum, Growth
 * - Score 0-100 por factor
 * - Score compuesto = promedio ponderado
 * - Labels: Outperform (top 33%), Neutral, Underperform (bottom 33%)
 */

type StockRaw = {
  symbol: string
  companyName: string
  price: number
  marketCap: number
  sector: string
  currency: string
  beta?: number
  // Ratios
  peRatio?: number
  pbRatio?: number
  evToEbitda?: number
  roe?: number
  roa?: number
  netProfitMargin?: number
  grossProfitMargin?: number
  currentRatio?: number
  debtRatio?: number
  dividendYield?: number
  freeCashFlowYield?: number
}

export type ScoredStock = {
  symbol: string
  name: string
  price: number
  marketCap: string
  sector: string
  currency: string
  beta: number
  // Factor scores (0-100)
  valueScore: number
  qualityScore: number
  compositeScore: number
  // Label
  label: 'Outperform' | 'Neutral' | 'Underperform'
  // Raw metrics
  peRatio: number
  roe: number
  netMargin: number
  debtRatio: number
}

function normalize(value: number, min: number, max: number, invert = false): number {
  if (max === min) return 50
  const n = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  return invert ? 100 - n : n
}

function safeNum(v: number | undefined | null, fallback = 0): number {
  if (v === undefined || v === null || isNaN(v) || !isFinite(v)) return fallback
  return v
}

function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(1)}T`
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`
  return `$${(mc / 1e6).toFixed(0)}M`
}

export function scoreStocks(stocks: StockRaw[]): ScoredStock[] {
  // Filter out stocks with missing critical data
  const valid = stocks.filter(s => s.price > 0 && s.marketCap > 0)

  // Collect arrays for normalization
  const pes = valid.map(s => safeNum(s.peRatio)).filter(v => v > 0 && v < 200)
  const roes = valid.map(s => safeNum(s.roe))
  const margins = valid.map(s => safeNum(s.netProfitMargin))
  const debts = valid.map(s => safeNum(s.debtRatio))
  const evEbitdas = valid.map(s => safeNum(s.evToEbitda)).filter(v => v > 0 && v < 100)

  const peMin = Math.min(...pes), peMax = Math.max(...pes)
  const roeMin = Math.min(...roes), roeMax = Math.max(...roes)
  const marginMin = Math.min(...margins), marginMax = Math.max(...margins)
  const debtMin = Math.min(...debts), debtMax = Math.max(...debts)
  const evMin = Math.min(...evEbitdas), evMax = Math.max(...evEbitdas)

  const scored = valid.map(s => {
    const pe = safeNum(s.peRatio)
    const ev = safeNum(s.evToEbitda)
    const roe = safeNum(s.roe)
    const margin = safeNum(s.netProfitMargin)
    const debt = safeNum(s.debtRatio)
    const currentRatio = safeNum(s.currentRatio, 1)
    const fcfYield = safeNum(s.freeCashFlowYield)

    // VALUE SCORE: bajo P/E y EV/EBITDA = más barato = mejor
    const peScore = pe > 0 && pe < 200 ? normalize(pe, peMin, peMax, true) : 40
    const evScore = ev > 0 && ev < 100 ? normalize(ev, evMin, evMax, true) : 40
    const fcfScore = Math.min(100, Math.max(0, fcfYield * 1000))
    const valueScore = (peScore * 0.4 + evScore * 0.4 + fcfScore * 0.2)

    // QUALITY SCORE: alto ROE, altos márgenes, baja deuda
    const roeScore = normalize(roe, roeMin, roeMax)
    const marginScore = normalize(margin, marginMin, marginMax)
    const debtScore = normalize(debt, debtMin, debtMax, true) // invertido: menos deuda = mejor
    const currentScore = Math.min(100, currentRatio * 30) // current ratio > 2 es bueno
    const qualityScore = (roeScore * 0.35 + marginScore * 0.35 + debtScore * 0.20 + currentScore * 0.10)

    // COMPOSITE SCORE
    const compositeScore = (valueScore * 0.45 + qualityScore * 0.55)

    return {
      symbol: s.symbol,
      name: s.companyName || s.symbol,
      price: s.price,
      marketCap: formatMarketCap(s.marketCap),
      sector: s.sector || 'N/A',
      currency: s.currency || 'USD',
      beta: safeNum(s.beta, 1),
      valueScore: Math.round(valueScore),
      qualityScore: Math.round(qualityScore),
      compositeScore: Math.round(compositeScore),
      label: 'Neutral' as const,
      peRatio: pe,
      roe: Math.round(roe * 100) / 100,
      netMargin: Math.round(margin * 100) / 100,
      debtRatio: Math.round(debt * 100) / 100,
    }
  })

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore)

  // Assign labels: top 33% = Outperform, bottom 33% = Underperform
  const n = scored.length
  return scored.map((s, i) => ({
    ...s,
    label: i < n * 0.33
      ? 'Outperform'
      : i > n * 0.67
        ? 'Underperform'
        : 'Neutral',
  }))
}

// Tomar solo los top N Outperformers como portafolio
export function buildPortfolio(scored: ScoredStock[], n: number): ScoredStock[] {
  return scored.filter(s => s.label === 'Outperform').slice(0, n)
}
