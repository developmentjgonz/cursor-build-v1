export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export interface TokenInfo {
  symbol: string
  mint: string
  decimals: number
}

const TOKENS: Record<string, TokenInfo> = {
  SOL: { symbol: 'SOL', mint: NATIVE_SOL_MINT, decimals: 9 },
  USDC: { symbol: 'USDC', mint: USDC_MINT, decimals: 6 },
}

export function resolveToken(symbolOrMint: string): TokenInfo {
  const key = symbolOrMint.trim()
  const bySymbol = TOKENS[key.toUpperCase()]
  if (bySymbol) {
    return bySymbol
  }

  const byMint = Object.values(TOKENS).find((token) => token.mint === key)
  if (byMint) {
    return byMint
  }

  throw new Error(`Unsupported token: ${symbolOrMint}. MVP supports SOL and USDC.`)
}
