export interface CatalogToken {
  symbol: string
  name: string
  mint: string
}

/** Curated Solana majors + memecoins for live Jupiter price reads. */
export const TRACKED_TOKENS: readonly CatalogToken[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
  },
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
  },
  {
    symbol: 'MEW',
    name: 'cat in a dogs world',
    mint: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
  },
]

export const MEMECOIN_SYMBOLS = new Set(['WIF', 'BONK', 'POPCAT', 'MEW'])
