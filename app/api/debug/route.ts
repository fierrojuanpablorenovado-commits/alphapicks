/**
 * GET /api/debug — endpoint temporal de diagnóstico
 * Verifica que el token esté disponible y prueba la conexión a DataBursatil
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.DATABURSATIL_TOKEN
  const tokenStatus = token
    ? `presente (${token.slice(0, 6)}...${token.slice(-4)}, len=${token.length})`
    : 'AUSENTE ❌'

  // Intento de conexión directo
  let dbResult: unknown = null
  let dbError: string | null = null
  let dbStatus: number | null = null

  if (token) {
    try {
      const url = `https://api.databursatil.com/v2/cotizaciones?token=${token}&emisora_serie=WALMEX*&bolsa=bmv&concepto=u,c,f`
      const res = await fetch(url, { cache: 'no-store' })
      dbStatus = res.status
      if (res.ok) {
        dbResult = await res.json()
      } else {
        dbError = `HTTP ${res.status}: ${res.statusText}`
        dbResult = await res.text().catch(() => null)
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e)
    }
  }

  // Test divisas también
  let divisasResult: unknown = null
  let divisasError: string | null = null
  if (token) {
    try {
      const url = `https://api.databursatil.com/v2/divisas?token=${token}`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) divisasResult = await res.json()
      else divisasError = `HTTP ${res.status}`
    } catch (e) {
      divisasError = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      DATABURSATIL_TOKEN: tokenStatus,
      FMP_API_KEY: process.env.FMP_API_KEY
        ? `presente (len=${process.env.FMP_API_KEY.length})`
        : 'AUSENTE',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },
    databursatil_cotizaciones: {
      httpStatus: dbStatus,
      error: dbError,
      data: dbResult,
    },
    databursatil_divisas: {
      error: divisasError,
      data: divisasResult,
    },
  })
}
