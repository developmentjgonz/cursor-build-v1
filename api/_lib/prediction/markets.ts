import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import { listDflowEvents, searchDflowEvents } from '../dflow/client'
import { flattenDflowEvents } from '../dflow/mapper'
import { getServerEnv } from '../env'
import {
  getKalshiMarket,
  listKalshiEvents,
  listKalshiMarkets,
} from '../kalshi/client'
import {
  filterMarketsByQuery,
  flattenKalshiEvents,
  mapKalshiMarketToContract,
  resolveSeriesTickerHint,
} from '../kalshi/mapper'
import { searchSimulatedMarkets } from './fixtures'
import { resolvePredictionMode } from './mode'

export interface PredictionMarketsResult {
  markets: PredictionMarket[]
  isSimulated: boolean
  message: string
}

function rankByVolume(markets: PredictionMarket[]): PredictionMarket[] {
  return [...markets].sort(
    (left, right) => (right.volumeUsd ?? 0) - (left.volumeUsd ?? 0),
  )
}

async function searchLiveKalshiMarkets(
  query: string,
): Promise<PredictionMarket[]> {
  const trimmedQuery = query.trim()
  const seriesTicker = trimmedQuery
    ? resolveSeriesTickerHint(trimmedQuery)
    : undefined

  if (seriesTicker) {
    const [events, markets] = await Promise.all([
      listKalshiEvents({ seriesTicker, limit: 20 }),
      listKalshiMarkets({ seriesTicker, limit: 40 }),
    ])

    const fromEvents = flattenKalshiEvents(events.events)
    const fromMarkets = (markets.markets ?? []).map((market) =>
      mapKalshiMarketToContract(market),
    )
    const merged = dedupeMarkets([...fromEvents, ...fromMarkets])
    const filtered = filterMarketsByQuery(merged, trimmedQuery)
    return rankByVolume(filtered.length > 0 ? filtered : merged).slice(0, 12)
  }

  const events = await listKalshiEvents({ limit: trimmedQuery ? 40 : 20 })
  const markets = flattenKalshiEvents(events.events)
  const filtered = trimmedQuery
    ? filterMarketsByQuery(markets, trimmedQuery)
    : markets

  return rankByVolume(filtered).slice(0, 12)
}

function dedupeMarkets(markets: PredictionMarket[]): PredictionMarket[] {
  const seen = new Set<string>()
  const result: PredictionMarket[] = []

  for (const market of markets) {
    if (seen.has(market.id)) {
      continue
    }

    seen.add(market.id)
    result.push(market)
  }

  return result
}

async function searchLiveDflowMarkets(
  query: string,
): Promise<PredictionMarket[]> {
  const env = getServerEnv()
  const trimmedQuery = query.trim()
  const response = trimmedQuery
    ? await searchDflowEvents(trimmedQuery)
    : await listDflowEvents()

  return flattenDflowEvents(response.events, env.usdcMint).slice(0, 12)
}

export async function searchPredictionMarkets(
  query = '',
): Promise<PredictionMarketsResult> {
  const mode = resolvePredictionMode()

  if (!mode.useLiveIntegration) {
    return {
      markets: searchSimulatedMarkets(query || 'market'),
      isSimulated: true,
      message:
        mode.simulatedReason ??
        'Simulated prediction markets are being used for this demo.',
    }
  }

  try {
    const dflowMarkets = await searchLiveDflowMarkets(query)
    if (dflowMarkets.length > 0) {
      return {
        markets: dflowMarkets,
        isSimulated: false,
        message: 'Live DFlow/Kalshi market data.',
      }
    }
  } catch {
    // Fall through to Kalshi public discovery, then simulated fixtures.
  }

  try {
    const kalshiMarkets = await searchLiveKalshiMarkets(query)
    if (kalshiMarkets.length > 0) {
      return {
        markets: kalshiMarkets,
        isSimulated: false,
        message:
          'Live Kalshi market data. DFlow settlement remains optional for browsing and asking Dilo.',
      }
    }
  } catch {
    // Fall through to simulated fixtures.
  }

  return {
    markets: searchSimulatedMarkets(query || 'market'),
    isSimulated: true,
    message:
      'Live market search is unavailable. Showing simulated fallback markets.',
  }
}

export async function getLiveMarketById(
  marketId: string,
): Promise<PredictionMarket | null> {
  try {
    const kalshiMarket = await getKalshiMarket(marketId)
    if (kalshiMarket) {
      return mapKalshiMarketToContract(kalshiMarket)
    }
  } catch {
    // Ignore and try broader search fallbacks below.
  }

  try {
    const result = await searchPredictionMarkets(marketId)
    return result.markets.find((market) => market.id === marketId) ?? null
  } catch {
    return null
  }
}
