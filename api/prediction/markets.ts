import { predictionMarketsRequestSchema } from '../../shared/contracts/api.js'
import { jsonResponse, parseBody } from '../_lib/http.js'
import { searchPredictionMarkets } from '../_lib/prediction/markets.js'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, predictionMarketsRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  const result = await searchPredictionMarkets(parsedRequest.data.query ?? '')

  return jsonResponse({
    data: {
      markets: result.markets,
      isSimulated: result.isSimulated,
      message: result.message,
    },
  })
}
