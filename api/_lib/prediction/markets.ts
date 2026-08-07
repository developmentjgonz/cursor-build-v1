import type { PredictionMarket } from '../../../shared/contracts/prediction-market.js'
import { filterAndRankMarkets } from '../../../shared/prediction/market-match.js'
import { listDflowEvents, searchDflowEvents } from '../dflow/client.js'
import { flattenDflowEvents } from '../dflow/mapper.js'
import { getServerEnv } from '../env.js'
import {
  getKalshiMarket,
  listKalshiEvents,
  listKalshiMarkets,
} from '../kalshi/client.js'
import {
  flattenKalshiEvents,
  mapKalshiMarketToContract,
  resolveSeriesTickerHint,
} from '../kalshi/mapper.js'
import { searchSimulatedMarkets } from './fixtures.js'
import { resolvePredictionMode } from './mode.js'

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

function finalizeMarkets(
  markets: PredictionMarket[],
  query: string,
): PredictionMarket[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return rankByVolume(markets).slice(0, 12)
  }

  return filterAndRankMarkets(markets, trimmedQuery).slice(0, 12)
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
    const ranked = finalizeMarkets(merged, trimmedQuery)

    // Only accept series results that actually match the query tokens.
    // Falling back to unfiltered series markets caused “wrong topic” answers.
    if (ranked.length > 0) {
      return ranked
    }
  }

  const events = await listKalshiEvents({ limit: trimmedQuery ? 40 : 20 })
  const markets = flattenKalshiEvents(events.events)
  return finalizeMarkets(markets, trimmedQuery)
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

  const markets = flattenDflowEvents(response.events, env.usdcMint)
  return finalizeMarkets(markets, trimmedQuery)
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

  // Only use simulated fixtures when the query is empty or clearly matches
  // a fixture topic — never substitute bitcoin for an unrelated ask.
  const simulated = searchSimulatedMarkets(query || 'market')
  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    const relevant = filterAndRankMarkets(simulated, trimmedQuery)
    if (relevant.length === 0) {
      return {
        markets: [],
        isSimulated: true,
        message: `No open markets matched “${trimmedQuery}.”`,
      }
    }

    return {
      markets: relevant.slice(0, 12),
      isSimulated: true,
      message:
        'Live market search is unavailable. Showing simulated fallback markets.',
    }
  }

  return {
    markets: simulated.slice(0, 12),
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
