import { walletEligibilityRequestSchema } from '../../shared/contracts/api.js'
import { jsonResponse, parseBody } from '../_lib/http.js'
import { checkWalletEligibility } from '../_lib/prediction/eligibility.js'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(
    request,
    walletEligibilityRequestSchema,
  )

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  const eligibility = await checkWalletEligibility(
    parsedRequest.data.walletAddress,
  )

  return jsonResponse({ data: eligibility })
}
