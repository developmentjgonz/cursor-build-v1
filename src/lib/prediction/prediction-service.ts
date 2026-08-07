import {
  predictionMarketsResponseSchema,
  serializedTransactionSchema,
  walletEligibilitySchema,
  type BuildPredictionTransactionRequest,
  type PredictionMarketsRequest,
  type PredictionMarketsResponse,
  type PredictionQuoteRequest,
  type SerializedTransaction,
  type WalletEligibility,
  type WalletEligibilityRequest,
} from '../../../shared/contracts/api'
import {
  predictionQuoteSchema,
  type PredictionQuote,
} from '../../../shared/contracts/quote'
import { postApi } from '../api-client'

export function searchPredictionMarkets(
  request: PredictionMarketsRequest,
): Promise<PredictionMarketsResponse> {
  return postApi(
    '/api/prediction/markets',
    request,
    predictionMarketsResponseSchema,
  )
}

export function getPredictionQuote(
  request: PredictionQuoteRequest,
): Promise<PredictionQuote> {
  return postApi('/api/prediction/quote', request, predictionQuoteSchema)
}

export function checkWalletEligibility(
  request: WalletEligibilityRequest,
): Promise<WalletEligibility> {
  return postApi(
    '/api/prediction/eligibility',
    request,
    walletEligibilitySchema,
  )
}

export function buildPredictionTransaction(
  request: BuildPredictionTransactionRequest,
): Promise<SerializedTransaction> {
  return postApi(
    '/api/prediction/transaction',
    request,
    serializedTransactionSchema,
  )
}
