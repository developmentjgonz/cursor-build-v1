import type { Intent } from '../../../shared/contracts/intent'
import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import {
  createMockSwapQuote,
  mockHoldings,
  mockTotalBalanceUsd,
} from '../../lib/mock/mock-data'
import {
  getPredictionQuote,
  searchPredictionMarkets,
} from '../../lib/prediction/prediction-service'
import { fetchTokenPrices } from '../../lib/tokens/token-service'
import type { MockWalletSnapshot } from '../wallet/use-mock-wallet'
import type { DiloReply } from './chat-types'
import { explainPredictionQuote, explainSwapQuote } from './mock-trade'

const quotedTitlePattern = /["“](.+?)["”]/
const fallbackWalletSnapshot: MockWalletSnapshot = {
  isConnected: true,
  address: null,
  totalBalanceUsd: mockTotalBalanceUsd,
  holdings: mockHoldings,
}

export async function prepareTradeReply(
  prompt: string,
  intent: Intent,
  walletSnapshot = fallbackWalletSnapshot,
): Promise<DiloReply> {
  if (intent.kind === 'prediction') {
    return preparePredictionTrade(prompt, intent)
  }

  return prepareSwapTrade(intent, walletSnapshot)
}

export async function prepareMarketsReply(query = ''): Promise<DiloReply> {
  const result = await searchPredictionMarkets({ query })
  const markets = result.markets.slice(0, 6)

  if (markets.length === 0) {
    return {
      text: `I could not find open markets for “${query || 'that topic'}.” Try bitcoin, the Fed, or a sports team.`,
      followUps: ['Show me bitcoin markets', 'Show me open markets'],
    }
  }

  const firstMarket = markets[0]
  const sourceNote = result.isSimulated
    ? ' These are simulated fallback markets.'
    : ''

  const secondMarket = markets[1]
  const spokenOptions = [firstMarket, secondMarket]
    .filter(Boolean)
    .map((market) => describeMarketOptions(market!))
    .join(' ')

  return {
    text: `Okay${query ? `, for ${query}` : ''} — here’s what you’ve got.${sourceNote} ${spokenOptions} Which side do you want, and how much?`,
    attachment: { kind: 'markets', markets },
    followUps: [
      `Put $2 on YES for ${firstMarket.title}`,
      `Put $2 on NO for ${firstMarket.title}`,
    ],
  }
}

function describeMarketOptions(market: PredictionMarket): string {
  const yesChance = Math.round(market.yesProbability * 100)
  const noChance = Math.round(market.noProbability * 100)
  const yesPayout = 2 / Math.max(market.yesProbability, 0.01)
  const noPayout = 2 / Math.max(market.noProbability, 0.01)

  return `“${market.title}” — YES is about ${yesChance}¢, NO about ${noChance}¢. Two bucks on YES pays about $${yesPayout.toFixed(2)} if it hits; two bucks on NO pays about $${noPayout.toFixed(2)}.`
}

async function preparePredictionTrade(
  prompt: string,
  intent: Extract<Intent, { kind: 'prediction' }>,
): Promise<DiloReply> {
  const result = await searchPredictionMarkets({
    query: intent.marketQuery || 'bitcoin',
  })
  const market = findBestMarket(result.markets, prompt, intent.marketQuery)

  if (!market) {
    return {
      text: 'I could not match that to an open market. Ask me to show markets for a topic first.',
      followUps: ['Show me open markets', 'Show me bitcoin markets'],
    }
  }

  const quote = await getPredictionQuote({
    intent: {
      kind: 'prediction',
      marketQuery: market.title,
      outcome: intent.outcome,
      amountUsd: intent.amountUsd,
    },
    marketId: market.id,
  })

  return {
    text: explainPredictionQuote(quote),
    attachment: {
      kind: 'prediction',
      quote,
    },
    followUps: ['Yes, confirm the trade', 'Show me open markets'],
  }
}

async function prepareSwapTrade(
  intent: Extract<Intent, { kind: 'swap' }>,
  walletSnapshot: MockWalletSnapshot,
): Promise<DiloReply> {
  const solHolding = walletSnapshot.holdings.find(
    (holding) => holding.symbol === 'SOL',
  )
  let solPriceUsd = 154

  try {
    const priced = await fetchTokenPrices({ symbols: ['SOL'] })
    const liveSol = priced.tokens.find((token) => token.symbol === 'SOL')
    if (liveSol) {
      solPriceUsd = liveSol.priceUsd
    }
  } catch {
    // Keep fallback price for sizing when Jupiter is unavailable.
  }

  let inputAmount =
    intent.amount ??
    (intent.walletPercentage !== undefined && solHolding
      ? (solHolding.amount * intent.walletPercentage) / 100
      : 0.05)

  // Intent amounts for SOL are often dollar-denominated in natural language.
  if (
    intent.inputToken === 'SOL' &&
    intent.amount !== undefined &&
    intent.amount >= 1
  ) {
    inputAmount = intent.amount / solPriceUsd
  }

  const quote = createMockSwapQuote(
    intent.inputToken,
    intent.outputToken,
    inputAmount,
  )

  return {
    text: explainSwapQuote(quote),
    attachment: {
      kind: 'swap',
      quote,
    },
    followUps: ['Yes, confirm the swap', 'Show me open markets'],
  }
}

function findBestMarket(
  markets: readonly PredictionMarket[],
  prompt: string,
  marketQuery: string,
): PredictionMarket | undefined {
  if (markets.length === 0) {
    return undefined
  }

  const normalizedPrompt = prompt.toLowerCase()
  const quotedTitle = quotedTitlePattern.exec(prompt)?.[1]?.toLowerCase()
  const normalizedQuery = marketQuery.toLowerCase()

  if (quotedTitle) {
    const exact = markets.find(
      (market) => market.title.toLowerCase() === quotedTitle,
    )
    if (exact) {
      return exact
    }

    const partial = markets.find((market) =>
      market.title.toLowerCase().includes(quotedTitle),
    )
    if (partial) {
      return partial
    }
  }

  const queryMatch = markets.find(
    (market) =>
      market.title.toLowerCase().includes(normalizedQuery) ||
      normalizedQuery.includes(market.title.toLowerCase()),
  )
  if (queryMatch) {
    return queryMatch
  }

  const titleMatch = markets.find((market) =>
    normalizedPrompt.includes(market.title.toLowerCase()),
  )

  return titleMatch ?? markets[0]
}
