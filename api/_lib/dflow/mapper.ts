import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import type { DflowEvent, DflowMarket, DflowMarketAccount } from './types'

function parseProbability(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)

  if (!Number.isFinite(parsed)) {
    return null
  }

  if (parsed > 1) {
    return Math.min(parsed / 100, 1)
  }

  return Math.min(Math.max(parsed, 0), 1)
}

function resolveYesProbability(market: DflowMarket): number {
  const candidates = [
    parseProbability(market.yesAsk),
    parseProbability(market.yesBid),
    market.noAsk ? 1 - (parseProbability(market.noAsk) ?? 0.5) : null,
    market.noBid ? 1 - (parseProbability(market.noBid) ?? 0.5) : null,
  ]

  for (const candidate of candidates) {
    if (candidate !== null && candidate > 0 && candidate < 1) {
      return candidate
    }
  }

  return 0.5
}

function resolveCloseTime(market: DflowMarket): string {
  if (typeof market.closeTime === 'number') {
    return new Date(market.closeTime * 1000).toISOString()
  }

  if (typeof market.closeTime === 'string') {
    const parsed = Date.parse(market.closeTime)
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString()
    }
  }

  const fallback = new Date()
  fallback.setDate(fallback.getDate() + 30)
  return fallback.toISOString()
}

function resolveSettlementAccount(
  market: DflowMarket,
  usdcMint: string,
): DflowMarketAccount | undefined {
  if (!market.accounts) {
    return undefined
  }

  return market.accounts[usdcMint] ?? Object.values(market.accounts)[0]
}

export function mapDflowMarketToContract(
  event: DflowEvent,
  market: DflowMarket,
  usdcMint: string,
): PredictionMarket | null {
  const settlementAccount = resolveSettlementAccount(market, usdcMint)
  const yesProbability = resolveYesProbability(market)
  const noProbability = Math.min(Math.max(1 - yesProbability, 0), 1)
  const isInitialized = Boolean(
    settlementAccount?.yesMint && settlementAccount?.noMint,
  )

  return {
    id: market.ticker,
    title: `${event.title}${market.title ? ` — ${market.title}` : ''}`,
    yesProbability,
    noProbability,
    closesAt: resolveCloseTime(market),
    isTradingAvailable:
      market.status === 'active' && isInitialized && yesProbability > 0,
    isSimulated: false,
  }
}

export function extractOutcomeMint(
  market: DflowMarket,
  usdcMint: string,
  outcome: 'YES' | 'NO',
): string | null {
  const settlementAccount = resolveSettlementAccount(market, usdcMint)

  if (!settlementAccount) {
    return null
  }

  return outcome === 'YES'
    ? (settlementAccount.yesMint ?? null)
    : (settlementAccount.noMint ?? null)
}

export function flattenDflowEvents(
  events: DflowEvent[] | undefined,
  usdcMint: string,
): PredictionMarket[] {
  if (!events) {
    return []
  }

  const markets: PredictionMarket[] = []

  for (const event of events) {
    for (const market of event.markets ?? []) {
      const mapped = mapDflowMarketToContract(event, market, usdcMint)
      if (mapped) {
        markets.push(mapped)
      }
    }
  }

  return markets
}

export function findDflowMarket(
  events: DflowEvent[] | undefined,
  marketId: string,
): { event: DflowEvent; market: DflowMarket } | null {
  if (!events) {
    return null
  }

  for (const event of events) {
    for (const market of event.markets ?? []) {
      if (market.ticker === marketId) {
        return { event, market }
      }
    }
  }

  return null
}
