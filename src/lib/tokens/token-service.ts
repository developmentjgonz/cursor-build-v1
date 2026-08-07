import {
  tokenPricesResponseSchema,
  trendingTokensResponseSchema,
  type TokenPricesRequest,
  type TokenPricesResponse,
  type TrendingTokensResponse,
} from '../../../shared/contracts/api'
import { getApi, postApi } from '../api-client'

export function fetchTrendingTokens(): Promise<TrendingTokensResponse> {
  return getApi('/api/tokens/trending', trendingTokensResponseSchema)
}

export function fetchTokenPrices(
  request: TokenPricesRequest,
): Promise<TokenPricesResponse> {
  return postApi('/api/tokens/prices', request, tokenPricesResponseSchema)
}
