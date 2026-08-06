import { swapQuoteRequestSchema } from '../../shared/contracts/api'
import { notImplemented, parseBody } from '../_lib/http'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, swapQuoteRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  return notImplemented('Jupiter/Metis quote')
}
