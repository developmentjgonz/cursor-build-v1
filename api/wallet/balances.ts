import { z } from 'zod'

import { apiError, jsonResponse, parseBody } from '../_lib/http.js'
import { isSwapServiceError } from '../_lib/swap/errors.js'
import { getWalletBalances } from '../_lib/swap/solana.js'

const balancesRequestSchema = z.object({
  walletAddress: z.string().trim().min(32).max(44),
})

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, balancesRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const balances = await getWalletBalances(parsedRequest.data.walletAddress)
    return jsonResponse({ data: balances })
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'BALANCES_FAILED',
      error instanceof Error ? error.message : 'Unable to read wallet balances',
    )
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const walletAddress = url.searchParams.get('walletAddress') ?? ''

  try {
    const balances = await getWalletBalances(walletAddress)
    return jsonResponse({ data: balances })
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'BALANCES_FAILED',
      error instanceof Error ? error.message : 'Unable to read wallet balances',
    )
  }
}
