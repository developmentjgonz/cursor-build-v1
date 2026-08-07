import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import type { KalshiEvent, KalshiMarket } from './types'

const SERIES_HINTS: readonly { pattern: RegExp; seriesTicker: string }[] = [
  { pattern: /\b(btc|bitcoin)\b/i, seriesTicker: 'KXBTC' },
  { pattern: /\b(eth|ethereum)\b/i, seriesTicker: 'KXETH' },
  { pattern: /\b(sol|solana)\b/i, seriesTicker: 'KXSOL' },
  { pattern: /\b(fed|fomc|rate cut|interest rate)\b/i, seriesTicker: 'KXFED' },
  { pattern: /\b(nba|basketball)\b/i, seriesTicker: 'KXNBAGAME' },
  { pattern: /\b(nfl|football)\b/i, seriesTicker: 'KXNFLGAME' },
  { pattern: /\b(trump|election|president)\b/i, seriesTicker: 'KXPRES' },
]

function parseDollars(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.min(Math.max(parsed, 0), 1)
}

function resolveYesProbability(market: KalshiMarket): number {
  const candidates = [
    parseDollars(market.yes_ask_dollars),
    parseDollars(market.yes_bid_dollars),
    parseDollars(market.last_price_dollars),
    market.no_ask_dollars
      ? 1 - (parseDollars(market.no_ask_dollars) ?? 0.5)
      : null,
  ]

  for (const candidate of candidates) {
    if (candidate !== null && candidate > 0 && candidate < 1) {
      return candidate
    }
  }

  return 0.5
}

function resolveCloseTime(market: KalshiMarket): string {
  if (market.close_time) {
    const parsed = Date.parse(market.close_time)
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString()
    }
  }

  const fallback = new Date()
  fallback.setDate(fallback.getDate() + 30)
  return fallback.toISOString()
}

function parseVolume(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function mapKalshiMarketToContract(
  market: KalshiMarket,
  category?: string,
): PredictionMarket {
  const yesProbability = resolveYesProbability(market)

  const noProbability = Number(
    Math.min(Math.max(1 - yesProbability, 0), 1).toFixed(4),
  )

  return {
    id: market.ticker,
    title: market.title?.trim() || market.ticker,
    yesProbability: Number(yesProbability.toFixed(4)),
    noProbability,
    closesAt: resolveCloseTime(market),
    isTradingAvailable: market.status === 'active',
    isSimulated: false,
    category: category ?? market.category,
    volumeUsd: parseVolume(market.volume_fp),
  }
}

export function flattenKalshiEvents(
  events: KalshiEvent[] | undefined,
): PredictionMarket[] {
  if (!events) {
    return []
  }

  const markets: PredictionMarket[] = []

  for (const event of events) {
    for (const market of event.markets ?? []) {
      if (market.status && market.status !== 'active') {
        continue
      }

      markets.push(mapKalshiMarketToContract(market, event.category))
    }
  }

  return markets
}

export function resolveSeriesTickerHint(query: string): string | undefined {
  for (const hint of SERIES_HINTS) {
    if (hint.pattern.test(query)) {
      return hint.seriesTicker
    }
  }

  return undefined
}

export function filterMarketsByQuery(
  markets: PredictionMarket[],
  query: string,
): PredictionMarket[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1)

  if (tokens.length === 0) {
    return markets
  }

  return markets.filter((market) => {
    const haystack = `${market.id} ${market.title} ${market.category ?? ''}`.toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}
