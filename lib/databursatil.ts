/**
 * DataBursatil API Client
 * API gratuita de datos bursátiles mexicanos (BMV + BIVA)
 * Base: https://api.databursatil.com/v2
 * Autenticación: query param ?token=TOKEN
 * Créditos: 200,000/mes (1 crédito por KiB transmitido)
 */

const BASE = 'https://api.databursatil.com/v2'
// .trim() elimina cualquier \n que echo haya añadido al guardar la variable en Vercel
const TOKEN = (process.env.DATABURSATIL_TOKEN ?? '').trim()

/**
 * Mapeo de tickers FMP (.MX) → DataBursatil (emisora_serie)
 * Algunos requieren sufijo * (serie única), otros tienen serie incluida
 */
export const FMP_TO_DB: Record<string, string> = {
  // IPC — Bolsa Mexicana de Valores
  'AMXL.MX':       'AMXL',        // América Móvil L
  'WALMEX.MX':     'WALMEX*',     // Walmart México
  'BIMBOA.MX':     'BIMBOA',      // Grupo Bimbo A
  'FEMSAUBD.MX':   'FEMSAUBD',    // FEMSA UBD
  'GCARSOA1.MX':   'GCARSOA1',    // Grupo Carso A1
  'GMEXICOB.MX':   'GMEXICOB',    // Grupo México B
  'GFINBURO.MX':   'GFINBURO',    // Grupo Financiero Inbursa O
  'CEMEXCPO.MX':   'CEMEXCPO',    // CEMEX CPO
  'TLEVICPO.MX':   'TLEVISACPO',  // Televisa CPO (actualizado)
  'KOFUBL.MX':     'KOFUBL',      // KOF UBL
  'GRUMAB.MX':     'GRUMAB',      // Gruma B
  'GAPB.MX':       'GAPB',        // GAP B
  'ASURB.MX':      'ASURB',       // ASUR B
  'OMAB.MX':       'OMAB',        // OMA B
  'GENTERA.MX':    'GENTERA*',    // Gentera
  'CHDRAUIB.MX':   'CHDRAUIB',    // Chedraui IB
  'ALSEA.MX':      'ALSEA*',      // Alsea
  'PINFRA.MX':     'PINFRA*',     // PINFRA
  'BOLSAA.MX':     'BOLSAA',      // Bolsa Mexicana A
  'BBAJIOO.MX':    'BBAJIOO',     // Banco del Bajío O
  'CUERVO.MX':     'CUERVO*',     // Cuervo
  'VESTA.MX':      'VESTA*',      // Vesta
  'Q.MX':          'Q*',          // Quálitas
  'GICSAB.MX':     'GICSAB',      // GICSA B
  'MEGACPO.MX':    'MEGACPO',     // Megacable CPO
  'LACOMERUBC.MX': 'LACOMERUBC',  // La Comer UBC
  // Notas: IENOVA, RATCPO, SITESB1, PE&OLES no disponibles en DataBursatil free tier
}

/**
 * Lista de todas las emisoras IPC disponibles en DataBursatil
 */
export const IPC_DB_TICKERS = Object.values(FMP_TO_DB)

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DBCotizacion = {
  u: number   // último precio (last price)
  p?: number  // precio promedio ponderado (VWAP)
  a?: number  // apertura (open)
  x?: number  // máximo (high)
  n?: number  // mínimo (low)
  c: number   // cambio % (% change)
  m?: number  // cambio monetario (MXN)
  v?: number  // volumen (shares)
  o?: number  // operaciones (trades count)
  i?: number  // importe (total MXN traded)
  f: string   // fecha/hora (timestamp "YYYY-MM-DD HH:MM:SS")
}

export type DBQuote = {
  symbol: string       // emisora_serie (e.g., WALMEX*)
  fmpSymbol: string    // símbolo FMP (e.g., WALMEX.MX)
  name?: string
  price: number
  open: number
  high: number
  low: number
  change: number       // % change
  changeAbs: number    // cambio monetario MXN
  volume: number
  importe: number      // total traded MXN
  trades: number
  timestamp: string
  exchange: 'bmv' | 'biva'
}

export type DBHistorico = {
  date: string
  price: number
  importe: number  // total traded in MXN
}

export type DBDivisas = {
  USDMXN: { u: number; c: number; m: number }
  EURMXN: { u: number; c: number; m: number }
  EURUSD: { u: number; c: number; m: number }
  GBPMXN: { u: number; c: number; m: number }
  GBPUSD: { u: number; c: number; m: number }
  CADMXN: { u: number; c: number; m: number }
  USDCAD: { u: number; c: number; m: number }
  USDJPY: { u: number; c: number; m: number }
  AUDUSD: { u: number; c: number; m: number }
  CHFMXN: { u: number; c: number; m: number }
  t: string  // timestamp
}

// ─── Cliente base ──────────────────────────────────────────────────────────────

async function dbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const qs = new URLSearchParams({ token: TOKEN, ...params }).toString()
  const url = `${BASE}/${endpoint}?${qs}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // cache 60s (datos casi en tiempo real)
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.error || data?.Error) return null
    return data as T
  } catch {
    return null
  }
}

// ─── Cotizaciones ──────────────────────────────────────────────────────────────

type DBCotizacionesRaw = Record<string, { bmv?: DBCotizacion; biva?: DBCotizacion }>

/**
 * Obtiene cotizaciones en tiempo real para una lista de tickers
 * @param tickers - array de emisora_serie (DataBursatil format)
 * @param exchange - 'bmv' | 'biva'
 * @param revalidate - segundos de caché (default 60)
 */
export async function getCotizaciones(
  tickers: string[],
  exchange: 'bmv' | 'biva' = 'bmv',
  revalidate = 60
): Promise<Record<string, DBCotizacion>> {
  if (tickers.length === 0) return {}

  const qs = new URLSearchParams({
    token: TOKEN,
    emisora_serie: tickers.join(','),
    bolsa: exchange,
    concepto: 'u,p,a,x,n,c,m,v,o,i,f',
  }).toString()

  try {
    const res = await fetch(`${BASE}/cotizaciones?${qs}`, {
      next: { revalidate },
    })
    if (!res.ok) return {}
    const data = await res.json() as DBCotizacionesRaw
    const d = data as Record<string, unknown>
    if (!d || d['error'] || d['Error']) return {}

    const result: Record<string, DBCotizacion> = {}
    for (const [ticker, exchanges] of Object.entries(data)) {
      const quote = exchanges[exchange]
      if (quote) result[ticker] = quote
    }
    return result
  } catch {
    return {}
  }
}

/**
 * Obtiene cotizaciones de todos los IPC tickers
 * Retorna en formato normalizado DBQuote[]
 */
export async function getIPCQuotes(revalidate = 60): Promise<DBQuote[]> {
  // Construir lookup inverso: DB ticker → FMP ticker
  const dbToFmp: Record<string, string> = {}
  for (const [fmp, db] of Object.entries(FMP_TO_DB)) {
    dbToFmp[db] = fmp
  }

  const cotizaciones = await getCotizaciones(IPC_DB_TICKERS, 'bmv', revalidate)

  return Object.entries(cotizaciones).map(([dbTicker, q]) => ({
    symbol: dbTicker,
    fmpSymbol: dbToFmp[dbTicker] ?? dbTicker,
    price: q.u,
    open: q.a ?? q.u,
    high: q.x ?? q.u,
    low: q.n ?? q.u,
    change: q.c,
    changeAbs: q.m ?? 0,
    volume: q.v ?? 0,
    importe: q.i ?? 0,
    trades: q.o ?? 0,
    timestamp: q.f,
    exchange: 'bmv',
  }))
}

/**
 * Cotización de una sola emisora
 */
export async function getQuote(
  ticker: string,
  exchange: 'bmv' | 'biva' = 'bmv'
): Promise<DBCotizacion | null> {
  const result = await getCotizaciones([ticker], exchange, 30)
  return result[ticker] ?? null
}

// ─── Históricos ────────────────────────────────────────────────────────────────

/**
 * Precios históricos de cierre (EOD)
 * @param ticker - emisora_serie (DataBursatil format, e.g. 'AMXL')
 * @param from - fecha inicio YYYY-MM-DD
 * @param to - fecha fin YYYY-MM-DD
 * @returns array ordenado cronológicamente de {date, price, importe}
 */
export async function getHistorico(
  ticker: string,
  from: string,
  to: string
): Promise<DBHistorico[]> {
  const raw = await dbFetch<Record<string, [number, number]>>('historicos', {
    emisora_serie: ticker,
    inicio: from,
    final: to,
  })
  if (!raw) return []

  return Object.entries(raw)
    .map(([date, [price, importe]]) => ({ date, price, importe }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calcula retorno de 1 año para un ticker
 * Útil para momentum scoring
 */
export async function getYearReturn(ticker: string): Promise<number | null> {
  const to = new Date()
  const from = new Date()
  from.setFullYear(from.getFullYear() - 1)

  const hist = await getHistorico(
    ticker,
    from.toISOString().slice(0, 10),
    to.toISOString().slice(0, 10)
  )
  if (hist.length < 2) return null

  const first = hist[0].price
  const last = hist[hist.length - 1].price
  if (first === 0) return null

  return ((last - first) / first) * 100
}

// ─── Divisas ───────────────────────────────────────────────────────────────────

/**
 * Tipos de cambio en tiempo real
 * Incluye USDMXN, EURMXN, GBPMXN y pares internacionales
 */
export async function getDivisas(): Promise<DBDivisas | null> {
  return dbFetch<DBDivisas>('divisas')
}

/**
 * Obtiene solo el tipo de cambio USD/MXN
 */
export async function getUSDMXN(): Promise<number | null> {
  const divisas = await getDivisas()
  return divisas?.USDMXN?.u ?? null
}

// ─── Intradía ─────────────────────────────────────────────────────────────────

export type DBIntradiaInterval = '1m' | '5m' | '1h'

export type DBCandle = {
  time: string    // "YYYY-MM-DD HH:MM:SS"
  open: number
  high: number
  low: number
  close: number
}

/**
 * Datos intradía por intervalo
 * La API retorna precio de cierre por vela; se construye OHLC agregando 1m
 *
 * @param ticker - emisora_serie DataBursatil (e.g. 'CEMEXCPO', 'WALMEX*')
 * @param from   - fecha inicio YYYY-MM-DD
 * @param to     - fecha fin YYYY-MM-DD
 * @param intervalo - '1m' | '5m' | '1h'
 */
export async function getIntradia(
  ticker: string,
  from: string,
  to: string,
  intervalo: DBIntradiaInterval = '1m'
): Promise<DBCandle[]> {
  const qs = new URLSearchParams({
    token: TOKEN,
    emisora_serie: ticker,
    bolsa: 'BMV',
    intervalo,
    inicio: from,
    final: to,
  }).toString()

  try {
    const res = await fetch(`${BASE}/intradia?${qs}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const raw = await res.json() as Record<string, Record<string, number>>
    const tickerData = raw[ticker]
    if (!tickerData || typeof tickerData !== 'object') return []

    const entries = Object.entries(tickerData).sort(([a], [b]) => a.localeCompare(b))
    if (entries.length === 0) return []

    // Si el intervalo es 1m, construimos OHLC grupados de 1 en 1
    // Si 5m o 1h, la API ya agrupa pero solo da close → aproximamos OHLC desde consecutivos
    if (intervalo === '1m') {
      return entries.map(([time, close], i) => {
        const prev = i > 0 ? entries[i - 1][1] : close
        return {
          time,
          open:  prev,
          high:  Math.max(prev, close),
          low:   Math.min(prev, close),
          close,
        }
      })
    }

    // Para 5m y 1h: open = close anterior, high/low estimados
    return entries.map(([time, close], i) => {
      const prev = i > 0 ? entries[i - 1][1] : close
      return {
        time,
        open:  prev,
        high:  Math.max(prev, close),
        low:   Math.min(prev, close),
        close,
      }
    })
  } catch {
    return []
  }
}

/**
 * Versión pura de precios (cierre por minuto) — más ligero para indicadores
 */
export async function getIntradiaPrecios(
  ticker: string,
  from: string,
  to: string,
  intervalo: DBIntradiaInterval = '1m'
): Promise<{ time: string; price: number }[]> {
  const qs = new URLSearchParams({
    token: TOKEN,
    emisora_serie: ticker,
    bolsa: 'BMV',
    intervalo,
    inicio: from,
    final: to,
  }).toString()

  try {
    const res = await fetch(`${BASE}/intradia?${qs}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const raw = await res.json() as Record<string, Record<string, number>>
    const tickerData = raw[ticker]
    if (!tickerData) return []

    return Object.entries(tickerData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, price]) => ({ time, price }))
  } catch {
    return []
  }
}

// ─── Indicadores Técnicos ─────────────────────────────────────────────────────

/**
 * RSI — Relative Strength Index
 * period = 14 típicamente
 */
export function calcRSI(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(prices.length).fill(null)
  if (prices.length < period + 1) return rsi

  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period; i < prices.length; i++) {
    if (i > period) {
      const diff = prices[i] - prices[i - 1]
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi[i] = Math.round((100 - 100 / (1 + rs)) * 100) / 100
  }
  return rsi
}

/**
 * EMA — Exponential Moving Average
 */
export function calcEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = new Array(prices.length).fill(null)
  if (prices.length < period) return ema

  const k = 2 / (period + 1)
  let prev = prices.slice(0, period).reduce((a, b) => a + b) / period
  ema[period - 1] = prev

  for (let i = period; i < prices.length; i++) {
    prev = prices[i] * k + prev * (1 - k)
    ema[i] = Math.round(prev * 100) / 100
  }
  return ema
}

/**
 * SMA — Simple Moving Average
 */
export function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    return Math.round((sum / period) * 100) / 100
  })
}

/**
 * MACD — Moving Average Convergence Divergence
 * @returns { macd, signal, histogram } arrays
 */
export function calcMACD(
  prices: number[],
  fast = 12,
  slow = 26,
  signal = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const emaFast  = calcEMA(prices, fast)
  const emaSlow  = calcEMA(prices, slow)
  const macdLine = prices.map((_, i) => {
    const f = emaFast[i], s = emaSlow[i]
    return f !== null && s !== null ? Math.round((f - s) * 10000) / 10000 : null
  })

  // Signal = EMA(9) de la línea MACD
  const macdValues = macdLine.filter((v): v is number => v !== null)
  const signalEMA  = calcEMA(macdValues, signal)

  // Re-alinear signal con índices originales
  const signalLine: (number | null)[] = new Array(prices.length).fill(null)
  let j = 0
  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] !== null) {
      signalLine[i] = signalEMA[j] ?? null
      j++
    }
  }

  const histogram = prices.map((_, i) => {
    const m = macdLine[i], s = signalLine[i]
    return m !== null && s !== null ? Math.round((m - s) * 10000) / 10000 : null
  })

  return { macd: macdLine, signal: signalLine, histogram }
}

/**
 * Bandas de Bollinger
 * @returns { upper, middle, lower } arrays
 */
export function calcBollinger(
  prices: number[],
  period = 20,
  stdDev = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calcSMA(prices, period)
  return {
    upper: prices.map((_, i) => {
      if (middle[i] === null) return null
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = middle[i]!
      const sd   = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period)
      return Math.round((mean + stdDev * sd) * 100) / 100
    }),
    middle,
    lower: prices.map((_, i) => {
      if (middle[i] === null) return null
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = middle[i]!
      const sd   = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period)
      return Math.round((mean - stdDev * sd) * 100) / 100
    }),
  }
}

/**
 * Señales automáticas basadas en indicadores
 */
export type TradingSignal = {
  type:       'BUY' | 'SELL' | 'NEUTRAL'
  strength:   'STRONG' | 'MODERATE' | 'WEAK'
  reason:     string
  rsi:        number | null
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  bbPosition: 'ABOVE' | 'INSIDE' | 'BELOW'
}

export function generateSignal(prices: number[]): TradingSignal {
  if (prices.length < 30) {
    return { type: 'NEUTRAL', strength: 'WEAK', reason: 'Datos insuficientes', rsi: null, macdSignal: 'NEUTRAL', bbPosition: 'INSIDE' }
  }

  const rsiArr  = calcRSI(prices, 14)
  const rsi     = rsiArr[rsiArr.length - 1]
  const { macd, signal } = calcMACD(prices)
  const { upper, lower } = calcBollinger(prices, 20, 2)

  const lastMacd   = macd[macd.length - 1]
  const lastSignal = signal[signal.length - 1]
  const lastPrice  = prices[prices.length - 1]
  const lastUpper  = upper[upper.length - 1]
  const lastLower  = lower[lower.length - 1]

  const macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' =
    lastMacd !== null && lastSignal !== null
      ? lastMacd > lastSignal ? 'BULLISH' : 'BEARISH'
      : 'NEUTRAL'

  const bbPosition: 'ABOVE' | 'INSIDE' | 'BELOW' =
    lastUpper !== null && lastLower !== null
      ? lastPrice > lastUpper ? 'ABOVE'
      : lastPrice < lastLower ? 'BELOW'
      : 'INSIDE'
      : 'INSIDE'

  let type: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
  let strength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK'
  let reason = ''

  // Lógica de señales combinadas
  if (rsi !== null && rsi < 30 && macdSignal === 'BULLISH') {
    type = 'BUY'; strength = 'STRONG'; reason = `RSI sobrevendido (${rsi.toFixed(1)}) + MACD alcista`
  } else if (rsi !== null && rsi > 70 && macdSignal === 'BEARISH') {
    type = 'SELL'; strength = 'STRONG'; reason = `RSI sobrecomprado (${rsi.toFixed(1)}) + MACD bajista`
  } else if (rsi !== null && rsi < 35) {
    type = 'BUY'; strength = 'MODERATE'; reason = `RSI en zona de sobreventa (${rsi.toFixed(1)})`
  } else if (rsi !== null && rsi > 65) {
    type = 'SELL'; strength = 'MODERATE'; reason = `RSI en zona de sobrecompra (${rsi.toFixed(1)})`
  } else if (bbPosition === 'BELOW' && macdSignal === 'BULLISH') {
    type = 'BUY'; strength = 'MODERATE'; reason = 'Precio bajo banda Bollinger + MACD alcista'
  } else if (bbPosition === 'ABOVE' && macdSignal === 'BEARISH') {
    type = 'SELL'; strength = 'MODERATE'; reason = 'Precio sobre banda Bollinger + MACD bajista'
  } else {
    reason = 'Sin señal clara — esperar confirmación'
  }

  return { type, strength, reason, rsi, macdSignal, bbPosition }
}

// ─── Índices Globales ─────────────────────────────────────────────────────────

export type DBIndice = {
  e: string      // nombre completo
  u: number      // último precio
  a: number      // apertura
  x: number      // máximo
  n: number      // mínimo
  c: number      // cambio %
  m: number      // cambio monetario
  v: number      // volumen
  ytdp: number   // rendimiento YTD %
  f: string      // timestamp
}

export type DBIndices = Record<string, DBIndice>

const INDEX_META: Record<string, { flag: string; region: string }> = {
  IPC:      { flag: '🇲🇽', region: 'México' },
  FTSEBIVA: { flag: '🇲🇽', region: 'México' },
  DJIA:     { flag: '🇺🇸', region: 'EE.UU.' },
  SP500:    { flag: '🇺🇸', region: 'EE.UU.' },
  NASDAQ:   { flag: '🇺🇸', region: 'EE.UU.' },
  FTSE100:  { flag: '🇬🇧', region: 'R. Unido' },
  DAX:      { flag: '🇩🇪', region: 'Alemania' },
  CAC40:    { flag: '🇫🇷', region: 'Francia' },
  NK225:    { flag: '🇯🇵', region: 'Japón' },
  HSI:      { flag: '🇭🇰', region: 'Hong Kong' },
  SSE:      { flag: '🇨🇳', region: 'China' },
  VIX:      { flag: '📊', region: 'Volatilidad' },
}

export async function getIndices(): Promise<(DBIndice & { symbol: string; flag: string; region: string })[]> {
  const raw = await dbFetch<DBIndices>('indices')
  if (!raw) return []
  return Object.entries(raw).map(([symbol, data]) => ({
    symbol,
    ...data,
    ...(INDEX_META[symbol] ?? { flag: '🌐', region: 'Global' }),
  }))
}

// ─── Noticias ─────────────────────────────────────────────────────────────────

export type DBNoticia = {
  titulo: string
  subtitulo?: string
  enlace?: string
  fecha?: string
  fuente?: string
  emisora?: string
}

export async function getNoticias(): Promise<DBNoticia[]> {
  const qs = new URLSearchParams({ token: TOKEN }).toString()
  try {
    const res = await fetch(`${BASE}/noticias?${qs}`, {
      next: { revalidate: 600 }, // 10 min
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// ─── Financieros ──────────────────────────────────────────────────────────────

export type DBFinancieroPeriodo = {
  revenue?: [string, number]
  profitloss?: [string, number]
  costofsales?: [string, number]
  grossprofit?: [string, number]
  profitlossfromoperatingactivities?: [string, number]
  profitlossbeforetax?: [string, number]
  incometaxexpensecontinuingoperations?: [string, number]
  financecosts?: [string, number]
  financeincome?: [string, number]
  administrativeexpense?: [string, number]
  basicearningslosspershare?: [string, number]
  assets?: [string, number]
  liabilities?: [string, number]
  equity?: [string, number]
  cashandcashequivalents?: [string, number]
  currentassets?: [string, number]
  noncurrentassets?: [string, number]
  currentliabilities?: [string, number]
  noncurrentliabilities?: [string, number]
  [key: string]: [string, number] | undefined
}

export type DBFinancierosResult = {
  posicion?: Record<string, DBFinancieroPeriodo>
  resultado_trimestre?: Record<string, DBFinancieroPeriodo>
  resultado_acumulado?: Record<string, DBFinancieroPeriodo>
  flujos?: Record<string, DBFinancieroPeriodo>
}

export type DBFinancierosType = 'posicion' | 'flujos' | 'resultado_trimestre' | 'resultado_acumulado'

/**
 * Estados financieros completos de una emisora mexicana
 * @param emisora - Nombre sin serie (e.g. 'CEMEX', 'FEMSA', 'WALMEX', 'BIMBO')
 * @param periodo - Formato '4T_2024', '1T_2024', etc. (T = trimestre)
 * @param tipos   - Array con los estados a obtener
 */
export async function getFinancieros(
  emisora: string,
  periodo: string,
  tipos: DBFinancierosType[] = ['resultado_trimestre']
): Promise<DBFinancierosResult | null> {
  const qs = new URLSearchParams({
    token: TOKEN,
    emisora,
    periodo,
    financieros: tipos.join(','),
  }).toString()
  try {
    const res = await fetch(`${BASE}/financieros?${qs}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.Error) return null
    return data as DBFinancierosResult
  } catch {
    return null
  }
}

/**
 * Calcula ratios financieros a partir del estado de resultados y balance
 * Útil para el modelo de scoring de largo plazo (reemplaza FMP para México)
 */
export function calcRatiosFromFinancieros(
  resultado: DBFinancieroPeriodo,
  posicion?: DBFinancieroPeriodo
): {
  grossMargin: number | null
  operatingMargin: number | null
  netMargin: number | null
  roe: number | null
  debtToAssets: number | null
  eps: number | null
} {
  const revenue   = resultado.revenue?.[1]
  const gross     = resultado.grossprofit?.[1]
  const operating = resultado.profitlossfromoperatingactivities?.[1]
  const net       = resultado.profitloss?.[1]
  const equity    = posicion?.equity?.[1]
  const assets    = posicion?.assets?.[1]
  const liab      = posicion?.liabilities?.[1]
  const eps       = resultado.basicearningslosspershare?.[1]

  return {
    grossMargin:     revenue && gross     ? Math.round((gross     / revenue) * 10000) / 100 : null,
    operatingMargin: revenue && operating ? Math.round((operating / revenue) * 10000) / 100 : null,
    netMargin:       revenue && net       ? Math.round((net       / revenue) * 10000) / 100 : null,
    roe:             equity  && net       ? Math.round((net       / equity)  * 10000) / 100 : null,
    debtToAssets:    assets  && liab      ? Math.round((liab      / assets)  * 10000) / 100 : null,
    eps:             eps ?? null,
  }
}

// ─── Emisoras ──────────────────────────────────────────────────────────────────

export type DBEmisora = {
  razon_social: string | null
  isin: string | null
  bolsa: string | null
  tipo_valor_descripcion: string | null
  estatus: 'ACTIVA' | 'SUSPENDIDA'
  acciones_en_circulacion: number | null
  rango_historicos: string | null
}

/**
 * Obtiene el catálogo completo de emisoras
 * Respuesta pesada (~2MB), usar con cautela (caches 24h automáticamente)
 */
export async function getEmisoras(): Promise<Record<string, Record<string, DBEmisora>> | null> {
  const qs = new URLSearchParams({ token: TOKEN }).toString()
  try {
    const res = await fetch(`${BASE}/emisoras?${qs}`, {
      next: { revalidate: 86400 }, // 24h cache
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
