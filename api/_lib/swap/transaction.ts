import { Connection } from '@solana/web3.js'

import type { SerializedTransaction } from '../../../shared/contracts/api.js'
import type { SwapQuote } from '../../../shared/contracts/quote.js'
import { getServerEnv } from '../env.js'
import { fromRawAmount } from './amounts.js'
import { SwapServiceError } from './errors.js'
import { fetchJupiterSwapTransaction } from './jupiter.js'
import { refreshJupiterQuoteFromSwapQuote } from './quote.js'
import { assertValidWallet } from './solana.js'
import { resolveToken } from './tokens.js'

async function resolveLastValidBlockHeight(
  provided: number | undefined,
): Promise<number> {
  if (provided && provided > 0) {
    return provided
  }

  const { quicknodeRpcUrl, solanaCommitment } = getServerEnv()
  const connection = new Connection(quicknodeRpcUrl, solanaCommitment)
  const latest = await connection.getLatestBlockhash(solanaCommitment)
  return latest.lastValidBlockHeight
}

export async function buildLiveSwapTransaction(params: {
  walletAddress: string
  quote: SwapQuote
}): Promise<SerializedTransaction> {
  const walletAddress = assertValidWallet(params.walletAddress)
  const jupiterQuote = await refreshJupiterQuoteFromSwapQuote({
    quote: params.quote,
    walletAddress,
  })

  const outputToken = resolveToken(params.quote.outputToken)
  const refreshedOut = fromRawAmount(jupiterQuote.outAmount, outputToken.decimals)
  const drift =
    Math.abs(refreshedOut - params.quote.expectedOutputAmount) /
    Math.max(params.quote.expectedOutputAmount, 1e-12)

  // Guard against stale quotes drifting too far before the user signs.
  if (drift > 0.02) {
    throw new SwapServiceError(
      'Quote expired or price moved more than 2%. Request a fresh quote.',
      409,
      'QUOTE_STALE',
      {
        expectedOutputAmount: params.quote.expectedOutputAmount,
        refreshedOutputAmount: refreshedOut,
      },
    )
  }

  const swap = await fetchJupiterSwapTransaction({
    quote: jupiterQuote,
    userPublicKey: walletAddress,
  })

  if (!swap.swapTransaction) {
    throw new SwapServiceError(
      'Jupiter did not return a swap transaction',
      502,
      'SWAP_BUILD_FAILED',
    )
  }

  const lastValidBlockHeight = await resolveLastValidBlockHeight(
    swap.lastValidBlockHeight,
  )

  return {
    transactionBase64: swap.swapTransaction,
    lastValidBlockHeight,
    isSimulated: false,
  }
}
