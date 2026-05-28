const BASE = 'https://financialmodelingprep.com/stable'
const KEY = process.env.FMP_API_KEY!

export type FMPProfile = {
  symbol: string
  companyName: string
  price: number
  marketCap: number
  beta: number
  sector: string
  industry: string
  currency: string
  exchange: string
  country: string
  change: number
  changePercentage: number
  volume: number
}

export type FMPKeyMetrics = {
  symbol: string
  date: string
  period: string
  peRatio: number
  pbRatio: number
  evToEbitda: number
  evToSales: number
  debtToEquity: number
  currentRatio: number
  roe: number
  roa: number
  roic: number
  freeCashFlowYield: number
  earningsYield: number
  marketCap: number
  enterpriseValue: number
}

export type FMPRatios = {
  symbol: string
  date: string
  grossProfitMargin: number
  netProfitMargin: number
  returnOnEquity: number
  returnOnAssets: number
  debtRatio: number
  currentRatio: number
  priceToEarningsRatio: number
  priceToBookRatio: number
  dividendYield: number
}

async function fmpFetch<T>(endpoint: string): Promise<T[]> {
  const url = `${BASE}/${endpoint}&apikey=${KEY}`
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data as T[]
  } catch {
    return []
  }
}

export async function getProfile(symbol: string): Promise<FMPProfile | null> {
  const data = await fmpFetch<FMPProfile>(`profile?symbol=${symbol}`)
  return data[0] ?? null
}

export async function getKeyMetrics(symbol: string): Promise<FMPKeyMetrics | null> {
  const data = await fmpFetch<FMPKeyMetrics>(`key-metrics?symbol=${symbol}&limit=1`)
  return data[0] ?? null
}

export async function getRatios(symbol: string): Promise<FMPRatios | null> {
  const data = await fmpFetch<FMPRatios>(`ratios?symbol=${symbol}&limit=1`)
  return data[0] ?? null
}

export async function getHistoricalPrices(symbol: string, from: string, to: string) {
  return fmpFetch<{ date: string; close: number; volume: number }>(
    `historical-price-eod/full?symbol=${symbol}&from=${from}&to=${to}`
  )
}

// Fetch profile + metrics + ratios en una sola llamada consolidada
export async function getStockData(symbol: string) {
  const [profile, metrics, ratios] = await Promise.all([
    getProfile(symbol),
    getKeyMetrics(symbol),
    getRatios(symbol),
  ])
  return { symbol, profile, metrics, ratios }
}

// Batch: fetch múltiples stocks con delay para respetar rate limit
export async function batchGetStockData(symbols: string[], delayMs = 200) {
  const results = []
  for (const symbol of symbols) {
    const data = await getStockData(symbol)
    results.push(data)
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
  }
  return results
}
