import { getServerEnv } from '../env'
import type {
  DflowEventsResponse,
  DflowOrderResponse,
  DflowProofResponse,
} from './types'

function buildHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  return headers
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `DFlow request failed (${response.status}): ${body.slice(0, 240)}`,
    )
  }

  return response.json() as Promise<T>
}

export async function searchDflowEvents(
  query: string,
): Promise<DflowEventsResponse> {
  const env = getServerEnv()
  const params = new URLSearchParams({
    query,
    withNestedMarkets: 'true',
    status: 'active',
    limit: '20',
  })

  const response = await fetch(
    `${env.dflowMetadataBaseUrl}/api/v1/search?${params}`,
    { headers: buildHeaders(env.dflowApiKey) },
  )

  return readJson<DflowEventsResponse>(response)
}

export async function listDflowEvents(): Promise<DflowEventsResponse> {
  const env = getServerEnv()
  const params = new URLSearchParams({
    withNestedMarkets: 'true',
    status: 'active',
    limit: '20',
  })

  const response = await fetch(
    `${env.dflowMetadataBaseUrl}/api/v1/events?${params}`,
    { headers: buildHeaders(env.dflowApiKey) },
  )

  return readJson<DflowEventsResponse>(response)
}

export async function getDflowOrder(params: {
  userPublicKey: string
  inputMint: string
  outputMint: string
  amountAtomic: number
}): Promise<DflowOrderResponse> {
  const env = getServerEnv()
  const searchParams = new URLSearchParams({
    userPublicKey: params.userPublicKey,
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: String(params.amountAtomic),
    slippageBps: 'auto',
    predictionMarketSlippageBps: 'auto',
  })

  const response = await fetch(
    `${env.dflowTradeBaseUrl}/order?${searchParams}`,
    { headers: buildHeaders(env.dflowApiKey) },
  )

  return readJson<DflowOrderResponse>(response)
}

export async function verifyWalletWithProof(
  walletAddress: string,
): Promise<DflowProofResponse> {
  const env = getServerEnv()
  const response = await fetch(
    `${env.dflowProofBaseUrl}/verify/${walletAddress}`,
    { headers: buildHeaders(env.dflowApiKey) },
  )

  return readJson<DflowProofResponse>(response)
}
