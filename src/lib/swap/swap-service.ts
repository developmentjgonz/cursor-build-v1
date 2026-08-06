import {
  serializedTransactionSchema,
  type BuildSwapTransactionRequest,
  type SerializedTransaction,
  type SwapQuoteRequest,
} from '../../../shared/contracts/api'
import {
  swapQuoteSchema,
  type SwapQuote,
} from '../../../shared/contracts/quote'
import { postApi } from '../api-client'

export function getSwapQuote(
  request: SwapQuoteRequest,
): Promise<SwapQuote> {
  return postApi('/api/swap/quote', request, swapQuoteSchema)
}

export function buildSwapTransaction(
  request: BuildSwapTransactionRequest,
): Promise<SerializedTransaction> {
  return postApi(
    '/api/swap/transaction',
    request,
    serializedTransactionSchema,
  )
}
