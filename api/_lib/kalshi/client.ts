import { getServerEnv } from '../env'
import type {
  KalshiEventsResponse,
  KalshiMarket,
  KalshiMarketsResponse,
} from './types'

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Kalshi request failed (${response.status}): ${body.slice(0, 240)}`,
    )
  }

  return response.json() as Promise<T>
}

function buildUrl(pathname: string, params: Record<string, string>): string {
  const env = getServerEnv()
  const url = new URL(pathname, env.kalshiApiBaseUrl)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

export async function listKalshiEvents(params?: {
  limit?: number
  status?: string
  seriesTicker?: string
}): Promise<KalshiEventsResponse> {
  const searchParams: Record<string, string> = {
    with_nested_markets: 'true',
    status: params?.status ?? 'open',
    limit: String(params?.limit ?? 20),
  }

  if (params?.seriesTicker) {
    searchParams.series_ticker = params.seriesTicker
  }

  const response = await fetch(buildUrl('/trade-api/v2/events', searchParams), {
    headers: { Accept: 'application/json' },
  })

  return readJson<KalshiEventsResponse>(response)
}

export async function listKalshiMarkets(params?: {
  limit?: number
  status?: string
  seriesTicker?: string
  ticker?: string
}): Promise<KalshiMarketsResponse> {
  const searchParams: Record<string, string> = {
    status: params?.status ?? 'open',
    limit: String(params?.limit ?? 40),
  }

  if (params?.seriesTicker) {
    searchParams.series_ticker = params.seriesTicker
  }

  if (params?.ticker) {
    searchParams.tickers = params.ticker
  }

  const response = await fetch(buildUrl('/trade-api/v2/markets', searchParams), {
    headers: { Accept: 'application/json' },
  })

  return readJson<KalshiMarketsResponse>(response)
}

export async function getKalshiMarket(
  ticker: string,
): Promise<KalshiMarket | null> {
  const response = await fetch(
    buildUrl(`/trade-api/v2/markets/${encodeURIComponent(ticker)}`, {}),
    { headers: { Accept: 'application/json' } },
  )

  if (response.status === 404) {
    return null
  }

  const data = await readJson<{ market?: KalshiMarket }>(response)
  return data.market ?? null
}
