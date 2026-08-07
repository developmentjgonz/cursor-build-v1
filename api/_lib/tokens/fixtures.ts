import type { TrendingToken } from '../../../shared/contracts/token.js'

export const mockTrendingTokens: readonly TrendingToken[] = [
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    priceUsd: 2.41,
    change24hPercentage: 18.6,
    volume24hUsd: 412_000_000,
    trend: [1.9, 1.95, 2.02, 1.98, 2.15, 2.3, 2.41],
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    priceUsd: 0.0000298,
    change24hPercentage: -5.2,
    volume24hUsd: 186_000_000,
    trend: [
      0.0000322, 0.0000318, 0.0000305, 0.00003, 0.0000296, 0.0000301, 0.0000298,
    ],
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    priceUsd: 1.12,
    change24hPercentage: 9.8,
    volume24hUsd: 94_000_000,
    trend: [0.98, 1.01, 1.0, 1.05, 1.09, 1.07, 1.12],
  },
  {
    symbol: 'MEW',
    name: 'cat in a dogs world',
    mint: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
    priceUsd: 0.0084,
    change24hPercentage: 4.1,
    volume24hUsd: 51_000_000,
    trend: [0.0079, 0.008, 0.0082, 0.0081, 0.0083, 0.0082, 0.0084],
  },
]
