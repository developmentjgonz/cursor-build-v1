import type { TrendingToken } from '../../../shared/contracts/token.js'
import { MEMECOIN_SYMBOLS, TRACKED_TOKENS } from '../jupiter/catalog.js'
import { fetchJupiterPrices } from '../jupiter/client.js'
import { mockTrendingTokens } from './fixtures.js'

export interface TrendingTokensResult {
  tokens: TrendingToken[]
  isSimulated: boolean
  message: string
}

function buildTrend(priceUsd: number, change24hPercentage: number): number[] {
  const safePrice = Math.max(priceUsd, Number.EPSILON)
  const start = safePrice / (1 + change24hPercentage / 100)
  const points = 7
  const trend: number[] = []

  for (let index = 0; index < points; index += 1) {
    const progress = index / (points - 1)
    trend.push(start + (safePrice - start) * progress)
  }

  return trend
}

export async function getTrendingTokens(): Promise<TrendingTokensResult> {
  try {
    const prices = await fetchJupiterPrices(TRACKED_TOKENS.map((token) => token.mint))
    const tokens: TrendingToken[] = []

    for (const token of TRACKED_TOKENS) {
      if (!MEMECOIN_SYMBOLS.has(token.symbol)) {
        continue
      }

      const quote = prices.get(token.mint)
      if (!quote) {
        continue
      }

      const change24hPercentage = quote.priceChange24h ?? 0

      tokens.push({
        symbol: token.symbol,
        name: token.name,
        mint: token.mint,
        priceUsd: quote.usdPrice,
        change24hPercentage,
        // Jupiter Price API exposes pool liquidity, not 24h volume.
        volume24hUsd: quote.liquidity,
        trend: buildTrend(quote.usdPrice, change24hPercentage),
      })
    }

    tokens.sort((left, right) => right.volume24hUsd - left.volume24hUsd)

    if (tokens.length === 0) {
      return {
        tokens: [...mockTrendingTokens],
        isSimulated: true,
        message: 'Jupiter returned no prices. Showing simulated tokens.',
      }
    }

    return {
      tokens,
      isSimulated: false,
      message: 'Live Jupiter prices for curated Solana memecoins.',
    }
  } catch {
    return {
      tokens: [...mockTrendingTokens],
      isSimulated: true,
      message: 'Jupiter price feed unavailable. Showing simulated tokens.',
    }
  }
}

export async function getTokenPricesBySymbol(
  symbols: readonly string[],
): Promise<Map<string, TrendingToken>> {
  const wanted = new Set(symbols.map((symbol) => symbol.toUpperCase()))
  const catalog = TRACKED_TOKENS.filter((token) => wanted.has(token.symbol))
  const prices = await fetchJupiterPrices(catalog.map((token) => token.mint))
  const result = new Map<string, TrendingToken>()

  for (const token of catalog) {
    const quote = prices.get(token.mint)
    if (!quote) {
      continue
    }

    const change24hPercentage = quote.priceChange24h ?? 0
    result.set(token.symbol, {
      symbol: token.symbol,
      name: token.name,
      mint: token.mint,
      priceUsd: quote.usdPrice,
      change24hPercentage,
      volume24hUsd: quote.liquidity,
      trend: buildTrend(quote.usdPrice, change24hPercentage),
    })
  }

  return result
}
