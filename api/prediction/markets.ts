import { predictionMarketsRequestSchema } from '../../shared/contracts/api'
import { notImplemented, parseBody } from '../_lib/http'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, predictionMarketsRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  return notImplemented('DFlow/Kalshi market search')
}
