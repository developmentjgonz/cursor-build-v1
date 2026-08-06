import {
  serializedTransactionSchema,
  type BuildPredictionTransactionRequest,
  type PredictionMarketsRequest,
  type SerializedTransaction,
} from '../../../shared/contracts/api'
import {
  predictionMarketsSchema,
  type PredictionMarket,
} from '../../../shared/contracts/prediction-market'
import { postApi } from '../api-client'

export function searchPredictionMarkets(
  request: PredictionMarketsRequest,
): Promise<PredictionMarket[]> {
  return postApi(
    '/api/prediction/markets',
    request,
    predictionMarketsSchema,
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
