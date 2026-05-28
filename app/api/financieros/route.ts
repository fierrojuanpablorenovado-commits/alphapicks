/**
 * GET /api/financieros?emisora=CEMEX&periodo=4T_2024&tipos=posicion,resultado_trimestre
 * Estados financieros + ratios calculados de emisoras mexicanas
 * Fuente: DataBursatil /financieros
 * Cache: 24h (datos trimestrales)
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  getFinancieros,
  calcRatiosFromFinancieros,
  type DBFinancierosType,
} from '@/lib/databursatil'

// Mapeo de emisora_serie → emisora (sin serie) para el endpoint financieros
const SERIE_TO_EMISORA: Record<string, string> = {
  'AMXL':       'AMX',
  'WALMEX*':    'WALMEX',
  'BIMBOA':     'BIMBO',
  'FEMSAUBD':   'FEMSA',
  'GCARSOA1':   'GCARSO',
  'GMEXICOB':   'GMEXICOB',
  'GFINBURO':   'GFINBUR',
  'CEMEXCPO':   'CEMEX',
  'TLEVISACPO': 'TLEVISA',
  'KOFUBL':     'KOF',
  'GRUMAB':     'GRUMA',
  'GAPB':       'GAP',
  'ASURB':      'ASUR',
  'OMAB':       'OMA',
  'GENTERA*':   'GENTERA',
  'CHDRAUIB':   'CHDRAUI',
  'ALSEA*':     'ALSEA',
  'PINFRA*':    'PINFRA',
  'BOLSAA':     'BOLSA',
  'BBAJIOO':    'BBAJIO',
  'CUERVO*':    'CUERVO',
  'VESTA*':     'VESTA',
  'Q*':         'Q',
  'GICSAB':     'GICSA',
  'MEGACPO':    'MEGACBL',
  'LACOMERUBC': 'LACOMU',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const emisora = searchParams.get('emisora') ?? 'CEMEX'
  const periodo = searchParams.get('periodo') ?? getLatestPeriod()
  const tiposParam = searchParams.get('tipos') ?? 'posicion,resultado_trimestre'
  const tipos = tiposParam.split(',') as DBFinancierosType[]

  try {
    const data = await getFinancieros(emisora, periodo, tipos)
    if (!data) {
      return NextResponse.json(
        { error: `Sin datos financieros para ${emisora} en ${periodo}` },
        { status: 404 }
      )
    }

    // Calcular ratios si tenemos resultado y posición
    let ratios = null
    const periodos = Object.keys(data.resultado_trimestre ?? data.posicion ?? {})
    const lastPeriodo = periodos[periodos.length - 1]
    if (lastPeriodo) {
      const resultado = data.resultado_trimestre?.[lastPeriodo]
      const posicion  = data.posicion?.[lastPeriodo]
      if (resultado) ratios = calcRatiosFromFinancieros(resultado, posicion)
    }

    return NextResponse.json({
      emisora,
      periodo,
      lastPeriodo,
      ratios,
      data,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
    })
  } catch (err) {
    console.error('Financieros error:', err)
    return NextResponse.json({ error: 'Error obteniendo financieros' }, { status: 500 })
  }
}

function getLatestPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  // Retrasamos 2 trimestres para asegurar disponibilidad
  const q = month <= 3 ? 3 : month <= 6 ? 4 : month <= 9 ? 1 : 2
  const y = (month <= 3 || (month <= 6 && month > 3)) ? year - 1 : year
  return `${q}T_${y}`
}
