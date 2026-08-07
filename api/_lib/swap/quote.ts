import type { SwapIntent } from '../../../shared/contracts/intent'
import type { SwapQuote } from '../../../shared/contracts/quote'
import { getServerEnv } from '../env'
import { fromRawAmount, percentOfBalance, toRawAmount } from './amounts'
import { SwapServiceError } from './errors'
import { fetchJupiterQuote, type JupiterQuote } from './jupiter'
import { assertValidWallet, getTokenBalanceRaw } from './solana'
import { resolveToken } from './tokens'

const QUOTE_TTL_MS = 45_000
const DEFAULT_FEE_SOL = 0.000005

export interface ResolvedSwapQuote {
  quote: SwapQuote
  jupiterQuote: JupiterQuote
}

async function resolveInputAmountRaw(
  intent: SwapIntent,
  walletAddress: string,
): Promise<{ amountRaw: bigint; inputToken: ReturnType<typeof resolveToken> }> {
  const inputToken = resolveToken(intent.inputToken)
  const outputToken = resolveToken(intent.outputToken)

  if (inputToken.mint === outputToken.mint) {
    throw new SwapServiceError(
      'inputToken and outputToken must differ',
      400,
      'SAME_TOKEN',
    )
  }

  if (intent.walletPercentage !== undefined) {
    const { amountRaw: balanceRaw } = await getTokenBalanceRaw(
      walletAddress,
      inputToken.mint,
    )

    if (balanceRaw <= 0n) {
      throw new SwapServiceError(
        `Wallet has no ${inputToken.symbol} balance`,
        400,
        'INSUFFICIENT_BALANCE',
      )
    }

    return {
      amountRaw: percentOfBalance(balanceRaw, intent.walletPercentage),
      inputToken,
    }
  }

  return {
    amountRaw: toRawAmount(intent.amount!, inputToken.decimals),
    inputToken,
  }
}

function mapJupiterToSwapQuote(
  intent: SwapIntent,
  jupiterQuote: JupiterQuote,
  inputAmountHuman: number,
): SwapQuote {
  const outputToken = resolveToken(intent.outputToken)
  const priceImpactPercentage = Number(jupiterQuote.priceImpactPct || 0)

  if (!Number.isFinite(priceImpactPercentage) || priceImpactPercentage < 0) {
    throw new SwapServiceError('Invalid price impact from quote', 502, 'BAD_QUOTE')
  }

  if (
    intent.maximumPriceImpactPercentage !== undefined &&
    priceImpactPercentage > intent.maximumPriceImpactPercentage
  ) {
    throw new SwapServiceError(
      `Price impact ${priceImpactPercentage}% exceeds max ${intent.maximumPriceImpactPercentage}%`,
      422,
      'PRICE_IMPACT_TOO_HIGH',
      { priceImpactPercentage, maximumPriceImpactPercentage: intent.maximumPriceImpactPercentage },
    )
  }

  const route = (jupiterQuote.routePlan ?? [])
    .map((step) => step.swapInfo?.label)
    .filter((label): label is string => Boolean(label))

  return {
    kind: 'swap',
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: inputAmountHuman,
    expectedOutputAmount: fromRawAmount(jupiterQuote.outAmount, outputToken.decimals),
    minimumOutputAmount: fromRawAmount(
      jupiterQuote.otherAmountThreshold,
      outputToken.decimals,
    ),
    priceImpactPercentage,
    estimatedFeeSol: DEFAULT_FEE_SOL,
    route: route.length > 0 ? route : ['Jupiter'],
    expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  }
}

export async function getLiveSwapQuote(params: {
  intent: SwapIntent
  walletAddress: string
}): Promise<ResolvedSwapQuote> {
  const walletAddress = assertValidWallet(params.walletAddress)
  const { defaultSlippageBps } = getServerEnv()
  const { amountRaw, inputToken } = await resolveInputAmountRaw(
    params.intent,
    walletAddress,
  )
  const outputToken = resolveToken(params.intent.outputToken)

  const jupiterQuote = await fetchJupiterQuote({
    inputMint: inputToken.mint,
    outputMint: outputToken.mint,
    amountRaw: amountRaw.toString(),
    slippageBps: defaultSlippageBps,
  })

  const quote = mapJupiterToSwapQuote(
    params.intent,
    jupiterQuote,
    fromRawAmount(amountRaw, inputToken.decimals),
  )

  return { quote, jupiterQuote }
}

/** Re-quote from a prior SwapQuote when building the unsigned transaction. */
export async function refreshJupiterQuoteFromSwapQuote(params: {
  quote: SwapQuote
  walletAddress: string
  maximumPriceImpactPercentage?: number
}): Promise<JupiterQuote> {
  assertValidWallet(params.walletAddress)
  const { defaultSlippageBps } = getServerEnv()
  const inputToken = resolveToken(params.quote.inputToken)
  const outputToken = resolveToken(params.quote.outputToken)
  const amountRaw = toRawAmount(params.quote.inputAmount, inputToken.decimals)

  const jupiterQuote = await fetchJupiterQuote({
    inputMint: inputToken.mint,
    outputMint: outputToken.mint,
    amountRaw: amountRaw.toString(),
    slippageBps: defaultSlippageBps,
  })

  const priceImpactPercentage = Number(jupiterQuote.priceImpactPct || 0)
  const maxImpact = params.maximumPriceImpactPercentage

  if (
    maxImpact !== undefined &&
    Number.isFinite(priceImpactPercentage) &&
    priceImpactPercentage > maxImpact
  ) {
    throw new SwapServiceError(
      `Price impact ${priceImpactPercentage}% exceeds max ${maxImpact}%`,
      422,
      'PRICE_IMPACT_TOO_HIGH',
      { priceImpactPercentage, maximumPriceImpactPercentage: maxImpact },
    )
  }

  return jupiterQuote
}
