import type { PredictionQuote } from '../../../shared/contracts/quote.js'
import type { SerializedTransaction } from '../../../shared/contracts/api.js'
import { getDflowOrder, searchDflowEvents } from '../dflow/client.js'
import { extractOutcomeMint, findDflowMarket } from '../dflow/mapper.js'
import { getServerEnv } from '../env.js'
import { SIMULATED_TRANSACTION } from './fixtures.js'
import { resolvePredictionMode } from './mode.js'

const USDC_DECIMALS = 6

function usdToAtomic(amountUsd: number): number {
  return Math.round(amountUsd * 10 ** USDC_DECIMALS)
}

export async function buildPredictionTransaction(params: {
  walletAddress: string
  quote: PredictionQuote
}): Promise<SerializedTransaction> {
  const mode = resolvePredictionMode()

  if (!mode.useLiveIntegration || params.quote.isSimulated) {
    return SIMULATED_TRANSACTION
  }

  try {
    const env = getServerEnv()
    const search = await searchDflowEvents(params.quote.marketTitle)
    const match = findDflowMarket(search.events, params.quote.marketId)

    if (!match) {
      return SIMULATED_TRANSACTION
    }

    const outputMint = extractOutcomeMint(
      match.market,
      env.usdcMint,
      params.quote.outcome,
    )

    if (!outputMint) {
      return SIMULATED_TRANSACTION
    }

    const order = await getDflowOrder({
      userPublicKey: params.walletAddress,
      inputMint: env.usdcMint,
      outputMint,
      amountAtomic: usdToAtomic(params.quote.costUsd),
    })

    if (!order.transaction || !order.lastValidBlockHeight) {
      return SIMULATED_TRANSACTION
    }

    return {
      transactionBase64: order.transaction,
      lastValidBlockHeight: order.lastValidBlockHeight,
      isSimulated: false,
    }
  } catch {
    return SIMULATED_TRANSACTION
  }
}
