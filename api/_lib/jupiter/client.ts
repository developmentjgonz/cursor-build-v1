import { getServerEnv } from '../env'

export interface JupiterPriceQuote {
  usdPrice: number
  priceChange24h: number | null
  liquidity: number
  decimals: number
  blockId: number | null
}

type JupiterPriceResponse = Record<
  string,
  {
    usdPrice?: number
    priceChange24h?: number | null
    liquidity?: number
    decimals?: number
    blockId?: number | null
  }
>

function buildHeaders(apiKey: string | undefined): Record<string, string> {
  if (!apiKey) {
    return {}
  }

  return { 'x-api-key': apiKey }
}

export async function fetchJupiterPrices(
  mints: readonly string[],
): Promise<Map<string, JupiterPriceQuote>> {
  if (mints.length === 0) {
    return new Map()
  }

  const env = getServerEnv()
  const ids = mints.join(',')
  const url = `${env.jupiterApiBaseUrl}/price/v3?ids=${encodeURIComponent(ids)}`
  const response = await fetch(url, {
    headers: buildHeaders(env.jupiterApiKey),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Jupiter price request failed (${response.status}): ${body.slice(0, 240)}`,
    )
  }

  const payload = (await response.json()) as JupiterPriceResponse
  const prices = new Map<string, JupiterPriceQuote>()

  for (const mint of mints) {
    const quote = payload[mint]
    if (!quote || typeof quote.usdPrice !== 'number') {
      continue
    }

    prices.set(mint, {
      usdPrice: quote.usdPrice,
      priceChange24h:
        typeof quote.priceChange24h === 'number' ? quote.priceChange24h : null,
      liquidity: typeof quote.liquidity === 'number' ? quote.liquidity : 0,
      decimals: typeof quote.decimals === 'number' ? quote.decimals : 0,
      blockId: typeof quote.blockId === 'number' ? quote.blockId : null,
    })
  }

  return prices
}
