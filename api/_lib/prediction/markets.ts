import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import { searchDflowEvents } from '../dflow/client'
import { flattenDflowEvents } from '../dflow/mapper'
import { getServerEnv } from '../env'
import { searchSimulatedMarkets } from './fixtures'
import { resolvePredictionMode } from './mode'

export interface PredictionMarketsResult {
  markets: PredictionMarket[]
  isSimulated: boolean
  message: string
}

export async function searchPredictionMarkets(
  query: string,
): Promise<PredictionMarketsResult> {
  const mode = resolvePredictionMode()

  if (!mode.useLiveIntegration) {
    return {
      markets: searchSimulatedMarkets(query),
      isSimulated: true,
      message:
        mode.simulatedReason ??
        'Simulated prediction markets are being used for this demo.',
    }
  }

  try {
    const env = getServerEnv()
    const response = await searchDflowEvents(query)
    const markets = flattenDflowEvents(response.events, env.usdcMint)

    if (markets.length === 0) {
      return {
        markets: searchSimulatedMarkets(query),
        isSimulated: true,
        message:
          'No live DFlow/Kalshi markets matched your query. Showing simulated fallback markets.',
      }
    }

    return {
      markets,
      isSimulated: false,
      message: 'Live DFlow/Kalshi market data.',
    }
  } catch {
    return {
      markets: searchSimulatedMarkets(query),
      isSimulated: true,
      message:
        'Live DFlow/Kalshi market search is unavailable. Showing simulated fallback markets.',
    }
  }
}
