import { swapQuoteRequestSchema } from '../../shared/contracts/api.js'
import { apiError, jsonResponse, parseBody } from '../_lib/http.js'
import { isSwapServiceError } from '../_lib/swap/errors.js'
import { getLiveSwapQuote } from '../_lib/swap/quote.js'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, swapQuoteRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const { quote } = await getLiveSwapQuote(parsedRequest.data)
    return jsonResponse({ data: quote })
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'SWAP_QUOTE_FAILED',
      error instanceof Error ? error.message : 'Unable to build swap quote',
    )
  }
}
