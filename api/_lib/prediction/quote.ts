import type { PredictionIntent } from '../../../shared/contracts/intent'
import type { PredictionQuote } from '../../../shared/contracts/quote'
import { getDflowOrder, searchDflowEvents } from '../dflow/client'
import {
  extractOutcomeMint,
  findDflowMarket,
  mapDflowMarketToContract,
} from '../dflow/mapper'
import { getServerEnv } from '../env'
import { buildSimulatedQuote, getSimulatedMarket } from './fixtures'
import { resolvePredictionMode } from './mode'

const USDC_DECIMALS = 6
const OUTCOME_TOKEN_DECIMALS = 6
const LAMPORTS_PER_SOL = 1_000_000_000

function usdToAtomic(amountUsd: number): number {
  return Math.round(amountUsd * 10 ** USDC_DECIMALS)
}

function atomicUsdcToUsd(amountAtomic: string): number {
  return Number(amountAtomic) / 10 ** USDC_DECIMALS
}

function atomicToNumber(value: string | undefined): number {
  if (!value) {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildQuoteFromOrder(params: {
  intent: PredictionIntent
  marketId: string
  marketTitle: string
  probability: number
  order: Awaited<ReturnType<typeof getDflowOrder>>
}): PredictionQuote {
  const outAmount = atomicToNumber(params.order.outAmount) / 10 ** OUTCOME_TOKEN_DECIMALS
  const potentialPayoutUsd =
    outAmount > 0 ? outAmount : params.intent.amountUsd / Math.max(params.probability, 0.01)
  const feeLamports = params.order.prioritizationFeeLamports ?? 5_000

  return {
    kind: 'prediction',
    marketId: params.marketId,
    marketTitle: params.marketTitle,
    outcome: params.intent.outcome,
    probability: params.probability,
    costUsd: atomicUsdcToUsd(params.order.inAmount),
    potentialPayoutUsd: Number(potentialPayoutUsd.toFixed(6)),
    estimatedFeeSol: Number((feeLamports / LAMPORTS_PER_SOL).toFixed(9)),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    isSimulated: false,
  }
}

export async function getPredictionQuote(params: {
  intent: PredictionIntent
  marketId: string
  walletAddress?: string
}): Promise<PredictionQuote> {
  const mode = resolvePredictionMode()

  if (!mode.useLiveIntegration) {
    const market = getSimulatedMarket(params.marketId)
    if (!market) {
      throw new Error('Simulated market not found')
    }

    return buildSimulatedQuote(params.intent, market)
  }

  try {
    const env = getServerEnv()
    const search = await searchDflowEvents(params.intent.marketQuery)
    const match = findDflowMarket(search.events, params.marketId)

    if (!match) {
      const simulatedMarket = getSimulatedMarket(params.marketId)
      if (simulatedMarket) {
        return buildSimulatedQuote(params.intent, simulatedMarket)
      }

      throw new Error('Market not found')
    }

    const mappedMarket = mapDflowMarketToContract(
      match.event,
      match.market,
      env.usdcMint,
    )

    if (!mappedMarket) {
      throw new Error('Market could not be mapped')
    }

    const outputMint = extractOutcomeMint(
      match.market,
      env.usdcMint,
      params.intent.outcome,
    )

    if (!outputMint) {
      return buildSimulatedQuote(
        params.intent,
        mappedMarket.isSimulated
          ? mappedMarket
          : { ...mappedMarket, isSimulated: true },
      )
    }

    const probability =
      params.intent.outcome === 'YES'
        ? mappedMarket.yesProbability
        : mappedMarket.noProbability

    if (params.walletAddress) {
      const order = await getDflowOrder({
        userPublicKey: params.walletAddress,
        inputMint: env.usdcMint,
        outputMint,
        amountAtomic: usdToAtomic(params.intent.amountUsd),
      })

      const liveQuote = buildQuoteFromOrder({
        intent: params.intent,
        marketId: params.marketId,
        marketTitle: mappedMarket.title,
        probability,
        order,
      })

      return liveQuote
    }

    const safeProbability = Math.max(probability, 0.01)

    return {
      kind: 'prediction',
      marketId: params.marketId,
      marketTitle: mappedMarket.title,
      outcome: params.intent.outcome,
      probability: safeProbability,
      costUsd: params.intent.amountUsd,
      potentialPayoutUsd: Number(
        (params.intent.amountUsd / safeProbability).toFixed(2),
      ),
      estimatedFeeSol: 0.000005,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      isSimulated: false,
    }
  } catch {
    const simulatedMarket = getSimulatedMarket(params.marketId)
    if (simulatedMarket) {
      return buildSimulatedQuote(params.intent, simulatedMarket)
    }

    throw new Error('Unable to retrieve a live or simulated quote')
  }
}
