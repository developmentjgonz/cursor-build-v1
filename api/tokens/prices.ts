import {
  tokenPricesRequestSchema,
  tokenPricesResponseSchema,
} from '../../shared/contracts/api'
import { apiError, jsonResponse, parseBody } from '../_lib/http'
import { getTokenPricesBySymbol } from '../_lib/tokens/trending'

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, tokenPricesRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  try {
    const priced = await getTokenPricesBySymbol(parsedRequest.data.symbols)
    const tokens = [...priced.values()]

    if (tokens.length === 0) {
      return jsonResponse({
        data: tokenPricesResponseSchema.parse({
          tokens: [],
          isSimulated: true,
          message: 'No live prices found for those symbols.',
        }),
      })
    }

    return jsonResponse({
      data: tokenPricesResponseSchema.parse({
        tokens,
        isSimulated: false,
        message: 'Live Jupiter prices.',
      }),
    })
  } catch (error) {
    return apiError(
      502,
      'JUPITER_PRICE_FAILED',
      error instanceof Error ? error.message : 'Unable to fetch token prices',
    )
  }
}
