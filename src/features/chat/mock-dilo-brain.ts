import {
  findBestMarketMatch,
  parsePredictionOutcome,
} from '../../../shared/prediction/market-match'
import {
  createMockSwapQuote,
  mockHoldings,
  mockTotalBalanceUsd,
} from '../../lib/mock/mock-data'
import type { MockWalletSnapshot } from '../wallet/use-mock-wallet'
import {
  getPredictionQuote,
  searchPredictionMarkets,
} from '../../lib/prediction/prediction-service'
import {
  fetchTokenPrices,
  fetchTrendingTokens,
} from '../../lib/tokens/token-service'
import { formatPrice } from '../../lib/format'
import type { DiloReply } from './chat-types'
import { explainPredictionQuote } from './mock-trade'
import { prepareMarketsReply } from './prepare-trade-reply'

const depositPattern = /deposit|dep[oó]sito|add (money|funds|cash)|recarga|fondear/i
const memecoinPattern = /meme|hottest|hot |trending|pumping|caliente|moviendo/i
const pricePattern =
  /\b(price|precio|worth|vale|how much is|cu[aá]nto (vale|cuesta))\b/i
const trackedTokenPattern = /\b(sol|solana|wif|bonk|popcat|mew)\b/i
const swapPattern = /swap|cambia|convert|convierte|trade|sell|vende/i
const marketListPattern =
  /open markets|what markets|show markets|mercados|prediction markets|show me .*market/i
const predictionPattern = /predict|bet|apuesta|odds|yes|no |wager|put \$?\d+/i
const balancePattern = /balance|how much|cu[aá]nto|wallet|tengo|holdings|portfolio/i
const greetingPattern = /^(hi|hey|hola|hello|qu[eé] tal|buenas)\b/i
const amountPattern = /\$\s?(\d+(?:\.\d+)?)/
const percentagePattern = /(\d+(?:\.\d+)?)\s?%/
const quotedTitlePattern = /["“](.+?)["”]/
const trackedTokenAliases: Record<string, string> = {
  sol: 'SOL',
  solana: 'SOL',
  wif: 'WIF',
  bonk: 'BONK',
  popcat: 'POPCAT',
  mew: 'MEW',
}

const defaultFollowUps = [
  'How much money do I have?',
  'What are the hottest memecoins?',
  'Show me open markets',
] as const

const fallbackWalletSnapshot: MockWalletSnapshot = {
  isConnected: true,
  address: null,
  totalBalanceUsd: mockTotalBalanceUsd,
  holdings: mockHoldings,
}

export async function createDiloReply(
  prompt: string,
  walletSnapshot = fallbackWalletSnapshot,
): Promise<DiloReply> {
  if (greetingPattern.test(prompt.trim())) {
    return {
      text: '¡Hola! I can check your wallet, scan what is moving, or set up a swap. What sounds good?',
      followUps: defaultFollowUps,
    }
  }

  if (depositPattern.test(prompt)) {
    return {
      text: 'You can fund this wallet two ways: send SOL or USDC from another wallet, or add USD with a card and I will convert it for you.',
      attachment: { kind: 'connect' },
      followUps: ['How much money do I have?', 'Swap $5 of SOL into USDC'],
    }
  }

  if (memecoinPattern.test(prompt)) {
    return createTrendingTokensReply()
  }

  if (pricePattern.test(prompt) || looksLikeTokenPriceAsk(prompt)) {
    return createTokenPriceReply(prompt)
  }

  if (swapPattern.test(prompt)) {
    const amountMatch = amountPattern.exec(prompt)
    const percentageMatch = percentagePattern.exec(prompt)
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
      // Keep the fallback price for mock swap sizing.
    }

    const inputAmount = amountMatch
      ? Number(amountMatch[1]) / solPriceUsd
      : percentageMatch && solHolding
        ? (solHolding.amount * Number(percentageMatch[1])) / 100
        : 0.05

    return {
      text: 'Got it. Here is the quote before anything moves. Check the numbers, then approve to sign in your wallet.',
      attachment: {
        kind: 'swap',
        quote: createMockSwapQuote('SOL', 'USDC', inputAmount),
      },
      followUps: ['What are the hottest memecoins?', 'Show me open markets'],
    }
  }

  if (marketListPattern.test(prompt)) {
    return createMarketsReply(prompt)
  }

  if (predictionPattern.test(prompt)) {
    return createPredictionReply(prompt)
  }

  if (balancePattern.test(prompt)) {
    if (!walletSnapshot.isConnected) {
      return {
        text: 'Connect your demo wallet first and I can read its balance.',
        attachment: { kind: 'connect' },
        followUps: ['Connect my wallet', 'What are the hottest memecoins?'],
      }
    }

    return {
      text: `Your demo wallet balance is $${walletSnapshot.totalBalanceUsd.toFixed(2)} right now.`,
      attachment: {
        kind: 'balance',
        totalUsd: walletSnapshot.totalBalanceUsd,
        holdings: walletSnapshot.holdings,
      },
      followUps: ['Swap $5 of SOL into USDC', 'What are the hottest memecoins?'],
    }
  }

  // Topic-shaped asks like "bitcoin" or "fed rates" should surface markets.
  if (looksLikeMarketTopic(prompt)) {
    return createMarketsReply(prompt)
  }

  return {
    text: 'I can handle balances, swaps, trending tokens, and prediction markets. Try one of these and I will show you exactly what would happen.',
    followUps: defaultFollowUps,
  }
}

async function createTrendingTokensReply(): Promise<DiloReply> {
  try {
    const result = await fetchTrendingTokens()
    const sourceNote = result.isSimulated
      ? ' These are simulated fallback prices.'
      : ''

    return {
      text: `Here is what is moving on Solana right now.${sourceNote}`,
      attachment: { kind: 'tokens', tokens: result.tokens },
      followUps: ['What is the price of SOL?', 'Put $10 into WIF'],
    }
  } catch {
    return {
      text: 'Live token prices are unavailable right now. Try again in a moment.',
      followUps: defaultFollowUps,
    }
  }
}

async function createTokenPriceReply(prompt: string): Promise<DiloReply> {
  const symbols = extractTrackedSymbols(prompt)
  const requested = symbols.length > 0 ? symbols : ['SOL']

  try {
    const result = await fetchTokenPrices({ symbols: requested })

    if (result.tokens.length === 0) {
      return {
        text: `I could not find a live price for ${requested.join(', ')}. Try SOL, WIF, BONK, POPCAT, or MEW.`,
        followUps: ['What are the hottest memecoins?', 'What is the price of SOL?'],
      }
    }

    if (result.tokens.length === 1) {
      const token = result.tokens[0]
      const change =
        token.change24hPercentage >= 0
          ? `up ${token.change24hPercentage.toFixed(2)}%`
          : `down ${Math.abs(token.change24hPercentage).toFixed(2)}%`

      return {
        text: `${token.symbol} is ${formatPrice(token.priceUsd)} right now (${change} in 24h).`,
        attachment: { kind: 'tokens', tokens: result.tokens },
        followUps: ['What are the hottest memecoins?', `Swap $5 of SOL into USDC`],
      }
    }

    return {
      text: 'Here are the live prices I found.',
      attachment: { kind: 'tokens', tokens: result.tokens },
      followUps: ['What are the hottest memecoins?', 'Show me open markets'],
    }
  } catch {
    return {
      text: 'Live token prices are unavailable right now. Try again in a moment.',
      followUps: defaultFollowUps,
    }
  }
}

function extractTrackedSymbols(prompt: string): string[] {
  const matches = prompt.toLowerCase().match(/\b(solana|sol|wif|bonk|popcat|mew)\b/g)
  if (!matches) {
    return []
  }

  const symbols: string[] = []
  for (const match of matches) {
    const symbol = trackedTokenAliases[match]
    if (symbol && !symbols.includes(symbol)) {
      symbols.push(symbol)
    }
  }

  return symbols
}

function looksLikeTokenPriceAsk(prompt: string): boolean {
  if (/put|buy|into|apuesta|bet\b/i.test(prompt)) {
    return false
  }

  return (
    trackedTokenPattern.test(prompt) &&
    !swapPattern.test(prompt) &&
    !predictionPattern.test(prompt) &&
    !marketListPattern.test(prompt) &&
    !balancePattern.test(prompt)
  )
}

async function createMarketsReply(prompt: string): Promise<DiloReply> {
  const query = extractMarketQuery(prompt)

  try {
    return await prepareMarketsReply(query)
  } catch {
    return {
      text: 'Live market search is unavailable right now. Try again in a moment.',
      followUps: defaultFollowUps,
    }
  }
}

async function createPredictionReply(prompt: string): Promise<DiloReply> {
  const amountMatch = amountPattern.exec(prompt)
  const amountUsd = amountMatch ? Number(amountMatch[1]) : 2
  const outcome = parsePredictionOutcome(prompt)
  const marketQuery = extractMarketQuery(prompt)

  if (!marketQuery) {
    return {
      text: 'Which market do you want to bet on? Name a topic like bitcoin, the Fed, or a team.',
      followUps: ['Show me open markets', 'Show me bitcoin markets'],
    }
  }

  try {
    const result = await searchPredictionMarkets({
      query: marketQuery,
    })
    const market = findBestMarketMatch(result.markets, prompt, marketQuery)

    if (!market) {
      return {
        text: `I could not match “${marketQuery}” to an open market. Ask me to show markets for that topic first.`,
        followUps: ['Show me open markets', `Show me ${marketQuery} markets`],
      }
    }

    const quote = await getPredictionQuote({
      intent: {
        kind: 'prediction',
        marketQuery: market.title,
        outcome,
        amountUsd,
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
  } catch {
    return {
      text: 'I could not price that market right now. Try showing open markets and picking one from the list.',
      followUps: ['Show me open markets'],
    }
  }
}

function extractMarketQuery(prompt: string): string {
  const quotedTitle = quotedTitlePattern.exec(prompt)?.[1]?.trim()
  if (quotedTitle) {
    return quotedTitle
  }

  return prompt
    .replace(amountPattern, ' ')
    .replace(
      /\b(show me|show|open|what|are|the|prediction|markets?|mercados|put|bet|apuesta|on|yes|no|for|about|odds|wager)\b/gi,
      ' ',
    )
    .replace(/[?!.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeMarketTopic(prompt: string): boolean {
  return /btc|bitcoin|eth|ethereum|solana|\bfed\b|fomc|rate cut|trump|election|nba|nfl|sports/i.test(
    prompt,
  )
}
