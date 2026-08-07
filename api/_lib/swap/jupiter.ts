import { getServerEnv } from '../env.js'
import { SwapServiceError } from './errors.js'

export interface JupiterQuote {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: { amount: string; feeBps: number } | null
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      label?: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
    }
    percent?: number
  }>
  [key: string]: unknown
}

export interface JupiterSwapResponse {
  swapTransaction: string
  lastValidBlockHeight?: number
  prioritizationFeeLamports?: number | null
  [key: string]: unknown
}

async function jupiterFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { jupiterApiBaseUrl } = getServerEnv()
  const url = `${jupiterApiBaseUrl}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (error) {
    throw new SwapServiceError(
      'Failed to reach Jupiter/Metis API',
      502,
      'JUPITER_UNREACHABLE',
      error,
    )
  }

  const text = await response.text()
  let payload: unknown = text
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      // keep raw text
    }
  }

  if (!response.ok) {
    throw new SwapServiceError(
      `Jupiter/Metis request failed (${response.status})`,
      502,
      'JUPITER_ERROR',
      payload,
    )
  }

  return payload as T
}

export async function fetchJupiterQuote(params: {
  inputMint: string
  outputMint: string
  amountRaw: string
  slippageBps: number
}): Promise<JupiterQuote> {
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amountRaw,
    slippageBps: String(params.slippageBps),
    swapMode: 'ExactIn',
  })

  return jupiterFetch<JupiterQuote>(`/quote?${search.toString()}`)
}

export async function fetchJupiterSwapTransaction(params: {
  quote: JupiterQuote
  userPublicKey: string
}): Promise<JupiterSwapResponse> {
  return jupiterFetch<JupiterSwapResponse>('/swap', {
    method: 'POST',
    body: JSON.stringify({
      quoteResponse: params.quote,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  })
}
