import type { PredictionMarket } from '../../../shared/contracts/prediction-market.js'
import type { PredictionIntent } from '../../../shared/contracts/intent.js'
import type { PredictionQuote } from '../../../shared/contracts/quote.js'
import { filterAndRankMarkets } from '../../../shared/prediction/market-match.js'

const SIMULATED_MARKETS: PredictionMarket[] = [
  {
    id: 'SIM-BTC-150K-DEC26',
    title: 'Will Bitcoin reach $150,000 by December 2026?',
    yesProbability: 0.42,
    noProbability: 0.58,
    closesAt: '2026-12-31T23:59:59.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
  {
    id: 'SIM-FED-RATE-CUT-JUN26',
    title: 'Will the Fed cut rates at the June 2026 FOMC meeting?',
    yesProbability: 0.61,
    noProbability: 0.39,
    closesAt: '2026-06-17T18:00:00.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
  {
    id: 'SIM-SOL-ETF-2026',
    title: 'Will a spot SOL ETF be approved in the US in 2026?',
    yesProbability: 0.28,
    noProbability: 0.72,
    closesAt: '2026-12-31T23:59:59.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
  {
    id: 'SIM-NBA-FINALS-2026',
    title: 'Will the Boston Celtics win the 2026 NBA Finals?',
    yesProbability: 0.19,
    noProbability: 0.81,
    closesAt: '2026-06-30T23:59:59.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
]

export function searchSimulatedMarkets(query: string): PredictionMarket[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery || trimmedQuery.toLowerCase() === 'market') {
    return SIMULATED_MARKETS.slice(0, 3)
  }

  const ranked = filterAndRankMarkets(SIMULATED_MARKETS, trimmedQuery)
  return ranked
}

export function getSimulatedMarket(marketId: string): PredictionMarket | null {
  return SIMULATED_MARKETS.find((market) => market.id === marketId) ?? null
}

export function buildSimulatedQuote(
  intent: PredictionIntent,
  market: PredictionMarket,
): PredictionQuote {
  const probability =
    intent.outcome === 'YES' ? market.yesProbability : market.noProbability
  const safeProbability = Math.max(probability, 0.01)
  const potentialPayoutUsd = intent.amountUsd / safeProbability
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  return {
    kind: 'prediction',
    marketId: market.id,
    marketTitle: market.title,
    outcome: intent.outcome,
    probability: safeProbability,
    costUsd: intent.amountUsd,
    potentialPayoutUsd: Number(potentialPayoutUsd.toFixed(2)),
    estimatedFeeSol: 0.000005,
    expiresAt,
    isSimulated: true,
  }
}

export const SIMULATED_TRANSACTION = {
  transactionBase64:
    'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDArczbMia1tLmq7zz4DinMNN0pJ1I8DXC2KeHWuCe0xCbbrApzGFJclmk4GtCVUEJ6HzoSPKgcQGS28N47uMD9yQ9HUEj4Ipjk+41brz8Q0B1fNwQmg2HYGlpT01JridZ2yx9BANKtB8FpiSPK9XvNUS6jWDrnPRfV3UjsiO7Ia+0u5iPad9Y8CXFVU9nT4YOM+4Pk7B/ymca7dC7Ze0f1AN/krRgHaG7vl71rzeG/nGkIj6scvr7X11kMKDIIyo7v6Vb6ujjvMMsTOid07P7JZgCSPGzW8sWV0gD6E8pEAn4+A7/CYc0P3/7uE5442Q4do+2LhpwHT+3f4E6H1Dx9+0pXY1K/5IFSsUtMwT1/v8Qtmj2RaWP2Lb8PHG8yvpQB1l0NdI6A9WL4WK2kmK/y2U8+inIttPlMZKSA',
  lastValidBlockHeight: 999_999_999,
  isSimulated: true as const,
}
