export type Market = 'MX' | 'US'

export type Stock = {
  ticker: string
  name: string
  sector: string
  entryDate: string
  entryPrice: number
  currentPrice: number
  totalReturn: number
  marketCap: string
}

export type StrategyMetrics = {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  sortinoRatio: number
  beta: number
  maxDrawdown: number
  vsIndex: number
}

export type PerformancePoint = {
  month: string
  strategy: number
  benchmark: number
}

export type Strategy = {
  slug: string
  name: string
  description: string
  market: Market
  benchmark: string
  stockCount: number
  stocks: Stock[]
  metrics: StrategyMetrics
  performance: PerformancePoint[]
  rebalanceDay: string
  badge?: string
}

// --- PERFORMANCE DATA GENERATOR ---
function genPerf(
  months: number,
  strategyMonthly: number,
  benchMonthly: number,
  startDate = '2015-01'
): PerformancePoint[] {
  const points: PerformancePoint[] = []
  let s = 100, b = 100
  const [startYear, startMonth] = startDate.split('-').map(Number)
  for (let i = 0; i < months; i++) {
    const date = new Date(startYear, startMonth - 1 + i)
    const label = date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short' })
    const noise = () => (Math.random() - 0.48) * 6
    s = s * (1 + strategyMonthly / 100 + noise() / 100)
    b = b * (1 + benchMonthly / 100 + noise() / 100)
    points.push({ month: label, strategy: Math.round(s * 10) / 10, benchmark: Math.round(b * 10) / 10 })
  }
  return points
}

// --- STRATEGIES ---
export const strategies: Strategy[] = [
  {
    slug: 'lideres-bmv',
    name: 'Líderes de la Bolsa Mexicana',
    description: 'Las mejores acciones del IPC seleccionadas por IA con base en fundamentales, momentum y calidad financiera.',
    market: 'MX',
    benchmark: 'IPC',
    stockCount: 15,
    badge: 'NUEVO',
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 288.1,
      annualizedReturn: 21.4,
      sharpeRatio: 1.42,
      sortinoRatio: 1.87,
      beta: 0.91,
      maxDrawdown: -24.3,
      vsIndex: 198.2,
    },
    stocks: [
      { ticker: 'CHDRAUI B', name: 'Grupo Comercial Chedraui B', sector: 'Consumo', entryDate: '2024-02-01', entryPrice: 142.5, currentPrice: 553.2, totalReturn: 288.1, marketCap: '$8.2B' },
      { ticker: 'GENTERA', name: 'Gentera SAB de CV', sector: 'Financiero', entryDate: '2024-03-01', entryPrice: 22.1, currentPrice: 51.8, totalReturn: 134.4, marketCap: '$1.9B' },
      { ticker: 'PE&OLES', name: 'Industrias Peñoles', sector: 'Minería', entryDate: '2024-04-01', entryPrice: 98.3, currentPrice: 165.8, totalReturn: 68.7, marketCap: '$3.4B' },
      { ticker: 'TLEVISA CPO', name: 'Grupo Televisa', sector: 'Medios', entryDate: '2024-05-01', entryPrice: 18.2, currentPrice: 30.5, totalReturn: 67.6, marketCap: '$2.1B' },
      { ticker: 'BIMBO A', name: 'Grupo Bimbo', sector: 'Consumo', entryDate: '2024-06-01', entryPrice: 68.4, currentPrice: 108.2, totalReturn: 58.2, marketCap: '$11.3B' },
      { ticker: 'FEMSA UBD', name: 'FEMSA', sector: 'Consumo', entryDate: '2024-07-01', entryPrice: 178.5, currentPrice: 262.3, totalReturn: 46.9, marketCap: '$22.1B' },
      { ticker: 'WALMEX V', name: 'Walmart de México', sector: 'Retail', entryDate: '2024-08-01', entryPrice: 68.2, currentPrice: 98.4, totalReturn: 44.3, marketCap: '$28.4B' },
      { ticker: 'AMXL', name: 'América Móvil', sector: 'Telecomunicaciones', entryDate: '2024-09-01', entryPrice: 14.8, currentPrice: 21.2, totalReturn: 43.2, marketCap: '$47.8B' },
      { ticker: 'GMEXICOB', name: 'Grupo México', sector: 'Minería', entryDate: '2024-10-01', entryPrice: 112.3, currentPrice: 158.4, totalReturn: 41.1, marketCap: '$34.2B' },
      { ticker: 'GRUMAB', name: 'Gruma', sector: 'Consumo', entryDate: '2024-11-01', entryPrice: 282.1, currentPrice: 391.5, totalReturn: 38.8, marketCap: '$4.8B' },
      { ticker: 'GFINBURB', name: 'Grupo Financiero Inbursa', sector: 'Financiero', entryDate: '2024-12-01', entryPrice: 38.4, currentPrice: 52.1, totalReturn: 35.7, marketCap: '$8.9B' },
      { ticker: 'ALSEA', name: 'Alsea', sector: 'Restaurantes', entryDate: '2025-01-01', entryPrice: 58.2, currentPrice: 78.3, totalReturn: 34.5, marketCap: '$2.3B' },
      { ticker: 'CEMEXCPO', name: 'Cemex', sector: 'Materiales', entryDate: '2025-02-01', entryPrice: 6.8, currentPrice: 9.1, totalReturn: 33.8, marketCap: '$9.4B' },
      { ticker: 'KOFUBL', name: 'Coca-Cola FEMSA', sector: 'Bebidas', entryDate: '2025-03-01', entryPrice: 142.8, currentPrice: 188.2, totalReturn: 31.8, marketCap: '$18.2B' },
      { ticker: 'GCARSOA1', name: 'Grupo Carso', sector: 'Conglomerado', entryDate: '2025-04-01', entryPrice: 82.4, currentPrice: 107.8, totalReturn: 30.8, marketCap: '$14.1B' },
    ],
    performance: genPerf(124, 1.78, 0.82),
  },
  {
    slug: 'beat-sp500',
    name: 'Beat the S&P 500',
    description: 'Las 20 acciones del S&P 500 con mayor potencial de superar al índice según nuestro modelo de IA.',
    market: 'US',
    benchmark: 'S&P 500',
    stockCount: 20,
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 670.7,
      annualizedReturn: 23.4,
      sharpeRatio: 1.68,
      sortinoRatio: 2.21,
      beta: 1.04,
      maxDrawdown: -28.1,
      vsIndex: 510.3,
    },
    stocks: [
      { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Tecnología', entryDate: '2024-01-01', entryPrice: 495.2, currentPrice: 1208.4, totalReturn: 144.1, marketCap: '$2.97T' },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Tecnología', entryDate: '2024-01-01', entryPrice: 353.9, currentPrice: 512.4, totalReturn: 44.8, marketCap: '$1.31T' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductores', entryDate: '2024-02-01', entryPrice: 1241.3, currentPrice: 1682.4, totalReturn: 35.5, marketCap: '$788B' },
      { ticker: 'GE', name: 'GE Aerospace', sector: 'Industrial', entryDate: '2024-03-01', entryPrice: 148.2, currentPrice: 198.4, totalReturn: 33.9, marketCap: '$214B' },
      { ticker: 'CRM', name: 'Salesforce', sector: 'Software', entryDate: '2024-04-01', entryPrice: 272.1, currentPrice: 358.2, totalReturn: 31.7, marketCap: '$346B' },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'Tecnología', entryDate: '2024-05-01', entryPrice: 182.4, currentPrice: 238.1, totalReturn: 30.5, marketCap: '$2.48T' },
      { ticker: 'LLY', name: 'Eli Lilly', sector: 'Salud', entryDate: '2024-06-01', entryPrice: 748.2, currentPrice: 968.4, totalReturn: 29.4, marketCap: '$921B' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Tecnología', entryDate: '2024-07-01', entryPrice: 408.2, currentPrice: 524.8, totalReturn: 28.6, marketCap: '$3.9T' },
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Tecnología', entryDate: '2024-08-01', entryPrice: 178.4, currentPrice: 224.8, totalReturn: 26.0, marketCap: '$3.45T' },
      { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Salud', entryDate: '2024-09-01', entryPrice: 524.8, currentPrice: 658.2, totalReturn: 25.4, marketCap: '$608B' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Tecnología', entryDate: '2024-10-01', entryPrice: 168.2, currentPrice: 209.4, totalReturn: 24.5, marketCap: '$2.58T' },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financiero', entryDate: '2024-11-01', entryPrice: 194.2, currentPrice: 240.8, totalReturn: 24.0, marketCap: '$694B' },
      { ticker: 'V', name: 'Visa Inc.', sector: 'Financiero', entryDate: '2024-12-01', entryPrice: 248.4, currentPrice: 305.8, totalReturn: 23.1, marketCap: '$638B' },
      { ticker: 'MA', name: 'Mastercard', sector: 'Financiero', entryDate: '2025-01-01', entryPrice: 448.2, currentPrice: 548.4, totalReturn: 22.4, marketCap: '$518B' },
      { ticker: 'HD', name: 'Home Depot', sector: 'Retail', entryDate: '2025-02-01', entryPrice: 358.4, currentPrice: 434.2, totalReturn: 21.1, marketCap: '$431B' },
      { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Retail', entryDate: '2025-03-01', entryPrice: 68.4, currentPrice: 82.8, totalReturn: 21.1, marketCap: '$664B' },
      { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumo', entryDate: '2025-04-01', entryPrice: 162.8, currentPrice: 195.4, totalReturn: 20.0, marketCap: '$461B' },
      { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Salud', entryDate: '2025-05-01', entryPrice: 152.4, currentPrice: 182.4, totalReturn: 19.7, marketCap: '$436B' },
      { ticker: 'BAC', name: 'Bank of America', sector: 'Financiero', entryDate: '2025-05-01', entryPrice: 38.4, currentPrice: 45.8, totalReturn: 19.3, marketCap: '$361B' },
      { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energía', entryDate: '2025-05-01', entryPrice: 114.2, currentPrice: 136.2, totalReturn: 19.3, marketCap: '$488B' },
    ],
    performance: genPerf(124, 2.1, 0.92),
  },
  {
    slug: 'tech-titans',
    name: 'Tech Titans',
    description: 'Las 15 empresas tecnológicas líderes en innovación con mayor potencial de crecimiento según IA.',
    market: 'US',
    benchmark: 'NASDAQ 100',
    stockCount: 15,
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 1183.0,
      annualizedReturn: 27.9,
      sharpeRatio: 1.91,
      sortinoRatio: 2.48,
      beta: 1.18,
      maxDrawdown: -38.2,
      vsIndex: 950.4,
    },
    stocks: [
      { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductores', entryDate: '2024-01-01', entryPrice: 495.2, currentPrice: 1208.4, totalReturn: 144.1, marketCap: '$2.97T' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Software', entryDate: '2024-01-01', entryPrice: 408.2, currentPrice: 524.8, totalReturn: 28.6, marketCap: '$3.9T' },
      { ticker: 'META', name: 'Meta Platforms', sector: 'Redes Sociales', entryDate: '2024-02-01', entryPrice: 353.9, currentPrice: 512.4, totalReturn: 44.8, marketCap: '$1.31T' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductores', entryDate: '2024-03-01', entryPrice: 1241.3, currentPrice: 1682.4, totalReturn: 35.5, marketCap: '$788B' },
      { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Hardware', entryDate: '2024-04-01', entryPrice: 178.4, currentPrice: 224.8, totalReturn: 26.0, marketCap: '$3.45T' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Internet', entryDate: '2024-05-01', entryPrice: 168.2, currentPrice: 209.4, totalReturn: 24.5, marketCap: '$2.58T' },
      { ticker: 'AMZN', name: 'Amazon.com', sector: 'Cloud/eComm', entryDate: '2024-06-01', entryPrice: 182.4, currentPrice: 238.1, totalReturn: 30.5, marketCap: '$2.48T' },
      { ticker: 'CRM', name: 'Salesforce', sector: 'SaaS', entryDate: '2024-07-01', entryPrice: 272.1, currentPrice: 358.2, totalReturn: 31.7, marketCap: '$346B' },
      { ticker: 'NOW', name: 'ServiceNow', sector: 'SaaS', entryDate: '2024-08-01', entryPrice: 742.8, currentPrice: 964.2, totalReturn: 29.8, marketCap: '$198B' },
      { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductores', entryDate: '2024-09-01', entryPrice: 168.4, currentPrice: 214.8, totalReturn: 27.6, marketCap: '$347B' },
      { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Software', entryDate: '2024-10-01', entryPrice: 498.4, currentPrice: 628.4, totalReturn: 26.1, marketCap: '$276B' },
      { ticker: 'ORCL', name: 'Oracle Corp.', sector: 'Software/Cloud', entryDate: '2024-11-01', entryPrice: 118.4, currentPrice: 148.2, totalReturn: 25.2, marketCap: '$407B' },
      { ticker: 'INTU', name: 'Intuit Inc.', sector: 'Fintech', entryDate: '2024-12-01', entryPrice: 618.4, currentPrice: 768.2, totalReturn: 24.2, marketCap: '$218B' },
      { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Ciberseguridad', entryDate: '2025-01-01', entryPrice: 348.4, currentPrice: 428.2, totalReturn: 22.9, marketCap: '$143B' },
      { ticker: 'SNOW', name: 'Snowflake', sector: 'Data Cloud', entryDate: '2025-02-01', entryPrice: 168.4, currentPrice: 204.8, totalReturn: 21.6, marketCap: '$68B' },
    ],
    performance: genPerf(124, 2.4, 1.02),
  },
  {
    slug: 'top-value',
    name: 'Top Value Stocks',
    description: 'Empresas infravaloradas con sólidos fundamentales. Enfoque value: bajo P/E, alto FCF, balance saludable.',
    market: 'US',
    benchmark: 'S&P 500 Value',
    stockCount: 15,
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 568.0,
      annualizedReturn: 22.2,
      sharpeRatio: 1.54,
      sortinoRatio: 2.08,
      beta: 0.88,
      maxDrawdown: -22.4,
      vsIndex: 418.6,
    },
    stocks: [
      { ticker: 'BRK.B', name: 'Berkshire Hathaway B', sector: 'Conglomerado', entryDate: '2024-01-01', entryPrice: 348.4, currentPrice: 462.8, totalReturn: 32.8, marketCap: '$1.02T' },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financiero', entryDate: '2024-02-01', entryPrice: 194.2, currentPrice: 240.8, totalReturn: 24.0, marketCap: '$694B' },
      { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energía', entryDate: '2024-03-01', entryPrice: 114.2, currentPrice: 136.2, totalReturn: 19.3, marketCap: '$488B' },
      { ticker: 'CVX', name: 'Chevron Corp.', sector: 'Energía', entryDate: '2024-04-01', entryPrice: 148.2, currentPrice: 174.8, totalReturn: 17.9, marketCap: '$328B' },
      { ticker: 'BAC', name: 'Bank of America', sector: 'Financiero', entryDate: '2024-05-01', entryPrice: 38.4, currentPrice: 45.8, totalReturn: 19.3, marketCap: '$361B' },
      { ticker: 'WFC', name: 'Wells Fargo', sector: 'Financiero', entryDate: '2024-06-01', entryPrice: 58.4, currentPrice: 69.2, totalReturn: 18.5, marketCap: '$232B' },
      { ticker: 'MRK', name: 'Merck & Co.', sector: 'Farmacéutico', entryDate: '2024-07-01', entryPrice: 128.4, currentPrice: 151.2, totalReturn: 17.8, marketCap: '$384B' },
      { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Farmacéutico', entryDate: '2024-08-01', entryPrice: 168.4, currentPrice: 196.8, totalReturn: 16.9, marketCap: '$348B' },
      { ticker: 'PM', name: 'Philip Morris', sector: 'Consumo', entryDate: '2024-09-01', entryPrice: 94.2, currentPrice: 109.8, totalReturn: 16.6, marketCap: '$170B' },
      { ticker: 'GS', name: 'Goldman Sachs', sector: 'Financiero', entryDate: '2024-10-01', entryPrice: 448.4, currentPrice: 521.2, totalReturn: 16.2, marketCap: '$174B' },
      { ticker: 'MS', name: 'Morgan Stanley', sector: 'Financiero', entryDate: '2024-11-01', entryPrice: 98.4, currentPrice: 114.2, totalReturn: 16.1, marketCap: '$185B' },
      { ticker: 'T', name: 'AT&T Inc.', sector: 'Telecomunicaciones', entryDate: '2024-12-01', entryPrice: 18.2, currentPrice: 21.1, totalReturn: 15.9, marketCap: '$151B' },
      { ticker: 'VZ', name: 'Verizon Comm.', sector: 'Telecomunicaciones', entryDate: '2025-01-01', entryPrice: 38.4, currentPrice: 44.4, totalReturn: 15.6, marketCap: '$178B' },
      { ticker: 'MO', name: 'Altria Group', sector: 'Consumo', entryDate: '2025-02-01', entryPrice: 44.2, currentPrice: 51.1, totalReturn: 15.6, marketCap: '$87B' },
      { ticker: 'IBM', name: 'IBM Corp.', sector: 'Tecnología', entryDate: '2025-03-01', entryPrice: 168.4, currentPrice: 194.2, totalReturn: 15.3, marketCap: '$177B' },
    ],
    performance: genPerf(124, 1.92, 0.88),
  },
  {
    slug: 'mid-cap-movers',
    name: 'Mid-Cap Movers',
    description: 'Empresas de mediana capitalización con alto potencial de crecimiento. El punto dulce entre riesgo y retorno.',
    market: 'US',
    benchmark: 'S&P Mid-Cap 400',
    stockCount: 15,
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 345.0,
      annualizedReturn: 19.0,
      sharpeRatio: 1.38,
      sortinoRatio: 1.84,
      beta: 1.12,
      maxDrawdown: -31.4,
      vsIndex: 248.2,
    },
    stocks: [
      { ticker: 'DECK', name: 'Deckers Outdoor', sector: 'Consumo', entryDate: '2024-01-01', entryPrice: 648.4, currentPrice: 928.4, totalReturn: 43.2, marketCap: '$22B' },
      { ticker: 'CRDO', name: 'Credo Technology', sector: 'Semiconductores', entryDate: '2024-02-01', entryPrice: 24.8, currentPrice: 34.8, totalReturn: 40.3, marketCap: '$5.4B' },
      { ticker: 'MEDP', name: 'Medpace Holdings', sector: 'Salud', entryDate: '2024-03-01', entryPrice: 282.4, currentPrice: 388.2, totalReturn: 37.5, marketCap: '$8.8B' },
      { ticker: 'TREX', name: 'Trex Company', sector: 'Materiales', entryDate: '2024-04-01', entryPrice: 68.4, currentPrice: 91.8, totalReturn: 34.2, marketCap: '$10.8B' },
      { ticker: 'WING', name: 'Wingstop Inc.', sector: 'Restaurantes', entryDate: '2024-05-01', entryPrice: 248.4, currentPrice: 328.4, totalReturn: 32.2, marketCap: '$10.1B' },
      { ticker: 'CELH', name: 'Celsius Holdings', sector: 'Bebidas', entryDate: '2024-06-01', entryPrice: 58.4, currentPrice: 76.8, totalReturn: 31.5, marketCap: '$8.1B' },
      { ticker: 'TXRH', name: 'Texas Roadhouse', sector: 'Restaurantes', entryDate: '2024-07-01', entryPrice: 148.4, currentPrice: 194.2, totalReturn: 30.9, marketCap: '$13.1B' },
      { ticker: 'GMED', name: 'Globus Medical', sector: 'Salud', entryDate: '2024-08-01', entryPrice: 58.4, currentPrice: 76.2, totalReturn: 30.5, marketCap: '$8.2B' },
      { ticker: 'KNX', name: 'Knight-Swift Transp.', sector: 'Transporte', entryDate: '2024-09-01', entryPrice: 58.4, currentPrice: 76.1, totalReturn: 30.3, marketCap: '$8.9B' },
      { ticker: 'LSTR', name: 'Landstar System', sector: 'Transporte', entryDate: '2024-10-01', entryPrice: 178.4, currentPrice: 231.8, totalReturn: 29.9, marketCap: '$8.1B' },
      { ticker: 'OLED', name: 'Universal Display', sector: 'Tecnología', entryDate: '2024-11-01', entryPrice: 148.4, currentPrice: 192.4, totalReturn: 29.6, marketCap: '$8.2B' },
      { ticker: 'RGEN', name: 'Repligen Corp.', sector: 'Biotecnología', entryDate: '2024-12-01', entryPrice: 148.4, currentPrice: 192.1, totalReturn: 29.4, marketCap: '$7.8B' },
      { ticker: 'HRI', name: 'Herc Holdings', sector: 'Equipo', entryDate: '2025-01-01', entryPrice: 128.4, currentPrice: 165.8, totalReturn: 29.1, marketCap: '$4.2B' },
      { ticker: 'PCVX', name: 'Vaxcyte Inc.', sector: 'Biotecnología', entryDate: '2025-02-01', entryPrice: 68.4, currentPrice: 88.1, totalReturn: 28.8, marketCap: '$8.4B' },
      { ticker: 'CSWI', name: 'CSW Industrials', sector: 'Industrial', entryDate: '2025-03-01', entryPrice: 248.4, currentPrice: 319.2, totalReturn: 28.5, marketCap: '$4.1B' },
    ],
    performance: genPerf(124, 1.65, 0.78),
  },
  {
    slug: 'dominate-dow',
    name: 'Dominate the Dow',
    description: 'Las 10 mejores acciones del Dow Jones Industrial Average seleccionadas por nuestro modelo de IA.',
    market: 'US',
    benchmark: 'DJIA',
    stockCount: 10,
    rebalanceDay: 'Primer día hábil de cada mes',
    metrics: {
      totalReturn: 452.0,
      annualizedReturn: 19.9,
      sharpeRatio: 1.48,
      sortinoRatio: 1.96,
      beta: 0.96,
      maxDrawdown: -26.8,
      vsIndex: 338.4,
    },
    stocks: [
      { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Tecnología', entryDate: '2024-01-01', entryPrice: 408.2, currentPrice: 524.8, totalReturn: 28.6, marketCap: '$3.9T' },
      { ticker: 'GS', name: 'Goldman Sachs', sector: 'Financiero', entryDate: '2024-02-01', entryPrice: 448.4, currentPrice: 521.2, totalReturn: 16.2, marketCap: '$174B' },
      { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Salud', entryDate: '2024-03-01', entryPrice: 524.8, currentPrice: 658.2, totalReturn: 25.4, marketCap: '$608B' },
      { ticker: 'HD', name: 'Home Depot', sector: 'Retail', entryDate: '2024-04-01', entryPrice: 358.4, currentPrice: 434.2, totalReturn: 21.1, marketCap: '$431B' },
      { ticker: 'CAT', name: 'Caterpillar', sector: 'Industrial', entryDate: '2024-05-01', entryPrice: 348.4, currentPrice: 418.2, totalReturn: 20.0, marketCap: '$202B' },
      { ticker: 'AMGN', name: 'Amgen Inc.', sector: 'Biotecnología', entryDate: '2024-06-01', entryPrice: 278.4, currentPrice: 328.4, totalReturn: 18.0, marketCap: '$176B' },
      { ticker: 'V', name: 'Visa Inc.', sector: 'Financiero', entryDate: '2024-07-01', entryPrice: 248.4, currentPrice: 305.8, totalReturn: 23.1, marketCap: '$638B' },
      { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financiero', entryDate: '2024-08-01', entryPrice: 194.2, currentPrice: 240.8, totalReturn: 24.0, marketCap: '$694B' },
      { ticker: 'AXP', name: 'American Express', sector: 'Financiero', entryDate: '2024-09-01', entryPrice: 224.2, currentPrice: 268.4, totalReturn: 19.7, marketCap: '$198B' },
      { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Retail', entryDate: '2024-10-01', entryPrice: 68.4, currentPrice: 82.8, totalReturn: 21.1, marketCap: '$664B' },
    ],
    performance: genPerf(124, 1.74, 0.84),
  },
]

export function getStrategy(slug: string): Strategy | undefined {
  return strategies.find(s => s.slug === slug)
}
