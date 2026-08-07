import { predictionQuoteRequestSchema } from '../../shared/contracts/api'
import { jsonResponse, apiError, parseBody } from '../_lib/http'
import { getPredictionQuote } from '../_lib/prediction/quote'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, predictionQuoteRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const quote = await getPredictionQuote(parsedRequest.data)

    return jsonResponse({ data: quote })
  } catch (error) {
    return apiError(
      502,
      'PREDICTION_QUOTE_FAILED',
      error instanceof Error ? error.message : 'Unable to build prediction quote',
    )
  }
}
