import { buildPredictionTransactionRequestSchema } from '../../shared/contracts/api'
import { jsonResponse, apiError, parseBody } from '../_lib/http'
import { buildPredictionTransaction } from '../_lib/prediction/transaction'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(
    request,
    buildPredictionTransactionRequestSchema,
  )

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const transaction = await buildPredictionTransaction(parsedRequest.data)

    return jsonResponse({ data: transaction })
  } catch (error) {
    return apiError(
      502,
      'PREDICTION_TRANSACTION_FAILED',
      error instanceof Error
        ? error.message
        : 'Unable to build prediction transaction',
    )
  }
}
