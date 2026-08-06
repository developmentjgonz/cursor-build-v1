import { buildPredictionTransactionRequestSchema } from '../../shared/contracts/api'
import { notImplemented, parseBody } from '../_lib/http'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(
    request,
    buildPredictionTransactionRequestSchema,
  )

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  return notImplemented('DFlow/Kalshi transaction')
}
