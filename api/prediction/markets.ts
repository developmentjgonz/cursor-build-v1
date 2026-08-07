import { predictionMarketsRequestSchema } from '../../shared/contracts/api'
import { apiError, jsonResponse, parseBody } from '../_lib/http'
import { searchPredictionMarkets } from '../_lib/prediction/markets'

export async function POST(request: Request): Promise<Response> {
  try {
    const parsedRequest = await parseBody(request, predictionMarketsRequestSchema)

    if ('response' in parsedRequest) {
      return parsedRequest.response
    }

    const result = await searchPredictionMarkets(parsedRequest.data.query)

    return jsonResponse({
      data: {
        markets: result.markets,
        isSimulated: result.isSimulated,
        message: result.message,
      },
    })
  } catch (error) {
    console.error('prediction/markets failed', error)

    return apiError(
      500,
      'PREDICTION_MARKETS_FAILED',
      error instanceof Error ? error.message : 'Unable to search prediction markets',
    )
  }
}
