import { z } from 'zod'

import { apiError, jsonResponse, parseBody } from '../_lib/http'
import { isSwapServiceError } from '../_lib/swap/errors'
import { sendSignedTransaction } from '../_lib/swap/solana'

const broadcastRequestSchema = z.object({
  signedTransaction: z.string().min(1),
})

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, broadcastRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const signature = await sendSignedTransaction(
      parsedRequest.data.signedTransaction,
    )

    return jsonResponse({
      data: {
        signature,
        status: 'submitted' as const,
      },
    })
  } catch (error) {
    if (isSwapServiceError(error)) {
      return apiError(error.status, error.code, error.message, error.details)
    }

    return apiError(
      502,
      'BROADCAST_FAILED',
      error instanceof Error ? error.message : 'Unable to broadcast transaction',
    )
  }
}
