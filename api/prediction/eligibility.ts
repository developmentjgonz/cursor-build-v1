import { walletEligibilityRequestSchema } from '../../shared/contracts/api'
import { jsonResponse, parseBody } from '../_lib/http'
import { checkWalletEligibility } from '../_lib/prediction/eligibility'

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
