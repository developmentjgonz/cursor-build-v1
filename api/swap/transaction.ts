import { buildSwapTransactionRequestSchema } from '../../shared/contracts/api.js'
import { apiError, jsonResponse, parseBody } from '../_lib/http.js'
import { isSwapServiceError } from '../_lib/swap/errors.js'
import { buildLiveSwapTransaction } from '../_lib/swap/transaction.js'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(
    request,
    buildSwapTransactionRequestSchema,
  )

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const transaction = await buildLiveSwapTransaction(parsedRequest.data)
    return jsonResponse({ data: transaction })
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'SWAP_TRANSACTION_FAILED',
      error instanceof Error
        ? error.message
        : 'Unable to build swap transaction',
    )
  }
}
