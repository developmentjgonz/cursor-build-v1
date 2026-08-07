import type {
  PredictionQuote,
  SwapQuote,
} from '../../../shared/contracts/quote'

export interface WalletHolding {
  symbol: string
  name: string
  amount: number
  valueUsd: number
  change24hPercentage: number
}

export interface TrendingToken {
  symbol: string
  name: string
  priceUsd: number
  change24hPercentage: number
  volume24hUsd: number
  trend: number[]
}

export interface PredictionMarketSummary {
  id: string
  title: string
  category: string
  yesProbability: number
  volumeUsd: number
  closesAt: string
}

export interface ActivityEntry {
  id: string
  summary: string
  detail: string
  timestamp: string
  status: 'confirmed' | 'pending'
}

export const mockWalletAddress = '7xKQ9fRtVm2sBnLp4dWzYcHgA3eUjTqN8vXyMrKdPzQw'

export const mockHoldings: readonly WalletHolding[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    amount: 4.82,
    valueUsd: 742.28,
    change24hPercentage: 3.4,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: 128.4,
    valueUsd: 128.4,
    change24hPercentage: 0,
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    amount: 1_240_000,
    valueUsd: 36.9,
    change24hPercentage: -5.2,
  },
]

export const mockTotalBalanceUsd = mockHoldings.reduce(
  (total, holding) => total + holding.valueUsd,
  0,
)

export const mockTrendingTokens: readonly TrendingToken[] = [
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    priceUsd: 2.41,
    change24hPercentage: 18.6,
    volume24hUsd: 412_000_000,
    trend: [1.9, 1.95, 2.02, 1.98, 2.15, 2.3, 2.41],
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    priceUsd: 0.0000298,
    change24hPercentage: -5.2,
    volume24hUsd: 186_000_000,
    trend: [0.0000322, 0.0000318, 0.0000305, 0.00003, 0.0000296, 0.0000301, 0.0000298],
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    priceUsd: 1.12,
    change24hPercentage: 9.8,
    volume24hUsd: 94_000_000,
    trend: [0.98, 1.01, 1.0, 1.05, 1.09, 1.07, 1.12],
  },
  {
    symbol: 'MEW',
    name: 'cat in a dogs world',
    priceUsd: 0.0084,
    change24hPercentage: 4.1,
    volume24hUsd: 51_000_000,
    trend: [0.0079, 0.008, 0.0082, 0.0081, 0.0083, 0.0082, 0.0084],
  },
]

export const mockPredictionMarkets: readonly PredictionMarketSummary[] = [
  {
    id: 'mkt-sol-300',
    title: 'Will SOL close above $300 this month?',
    category: 'Crypto',
    yesProbability: 0.38,
    volumeUsd: 1_240_000,
    closesAt: 'Closes in 12 days',
  },
  {
    id: 'mkt-fed-cut',
    title: 'Will the Fed cut rates at the next meeting?',
    category: 'Macro',
    yesProbability: 0.62,
    volumeUsd: 4_870_000,
    closesAt: 'Closes in 3 weeks',
  },
  {
    id: 'mkt-btc-ath',
    title: 'Will BTC set a new all-time high before July?',
    category: 'Crypto',
    yesProbability: 0.71,
    volumeUsd: 8_120_000,
    closesAt: 'Closes in 2 months',
  },
  {
    id: 'mkt-champions',
    title: 'Will Real Madrid win the Champions League?',
    category: 'Sports',
    yesProbability: 0.24,
    volumeUsd: 2_050_000,
    closesAt: 'Closes in 5 weeks',
  },
]

export const mockActivity: readonly ActivityEntry[] = [
  {
    id: 'act-1',
    summary: 'Swapped 0.25 SOL to USDC',
    detail: '38.51 USDC received',
    timestamp: 'Today, 2:14 PM',
    status: 'confirmed',
  },
  {
    id: 'act-2',
    summary: 'Bought YES on “Fed cuts rates”',
    detail: '$5.00 at 62¢',
    timestamp: 'Yesterday, 9:02 AM',
    status: 'confirmed',
  },
]

export function createMockSwapQuote(
  inputToken: string,
  outputToken: string,
  inputAmount: number,
): SwapQuote {
  const solPriceUsd = 154
  const expectedOutputAmount =
    inputToken === 'SOL' ? inputAmount * solPriceUsd : inputAmount / solPriceUsd

  return {
    kind: 'swap',
    inputToken,
    outputToken,
    inputAmount,
    expectedOutputAmount,
    minimumOutputAmount: expectedOutputAmount * 0.995,
    priceImpactPercentage: 0.08,
    estimatedFeeSol: 0.000021,
    route: ['Orca', 'Meteora'],
    expiresAt: new Date(Date.now() + 30_000).toISOString(),
  }
}

export function createMockPredictionQuote(
  market: PredictionMarketSummary,
  outcome: 'YES' | 'NO',
  amountUsd: number,
): PredictionQuote {
  const probability =
    outcome === 'YES' ? market.yesProbability : 1 - market.yesProbability

  return {
    kind: 'prediction',
    marketId: market.id,
    marketTitle: market.title,
    outcome,
    probability,
    costUsd: amountUsd,
    potentialPayoutUsd: amountUsd / probability,
    estimatedFeeSol: 0.000018,
    expiresAt: new Date(Date.now() + 45_000).toISOString(),
  }
}
