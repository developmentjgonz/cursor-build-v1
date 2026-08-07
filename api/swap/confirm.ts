import { z } from 'zod'

import { apiError, jsonResponse, parseBody } from '../_lib/http.js'
import { isSwapServiceError } from '../_lib/swap/errors.js'
import { confirmSignature } from '../_lib/swap/solana.js'

const confirmRequestSchema = z.object({
  signature: z.string().min(1),
})

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, confirmRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const result = await confirmSignature(parsedRequest.data.signature)
    return jsonResponse({ data: result }, result.confirmed ? 200 : 502)
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'CONFIRM_FAILED',
      error instanceof Error ? error.message : 'Unable to confirm transaction',
    )
  }
}
