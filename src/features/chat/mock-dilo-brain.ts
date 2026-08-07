import {
  createMockPredictionQuote,
  createMockSwapQuote,
  mockHoldings,
  mockPredictionMarkets,
  mockTotalBalanceUsd,
  mockTrendingTokens,
} from '../../lib/mock/mock-data'
import type { DiloReply } from './chat-types'

const depositPattern = /deposit|dep[oó]sito|add (money|funds|cash)|recarga|fondear/i
const memecoinPattern = /meme|hottest|hot |trending|pumping|caliente|moviendo/i
const swapPattern = /swap|cambia|convert|convierte|trade|sell|vende/i
const marketListPattern = /open markets|what markets|show markets|mercados|prediction markets/i
const predictionPattern = /predict|bet|apuesta|odds|yes|no |wager/i
const balancePattern = /balance|how much|cu[aá]nto|wallet|tengo|holdings|portfolio/i
const greetingPattern = /^(hi|hey|hola|hello|qu[eé] tal|buenas)\b/i
const amountPattern = /\$\s?(\d+(?:\.\d+)?)/
const percentagePattern = /(\d+(?:\.\d+)?)\s?%/

const defaultFollowUps = [
  'How much money do I have?',
  'What are the hottest memecoins?',
  'Show me open markets',
] as const

export function createDiloReply(prompt: string): DiloReply {
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
    return {
      text: 'Here is what is moving most on Solana in the last 24 hours. Numbers are mocked while the data feed is wired up.',
      attachment: { kind: 'tokens', tokens: mockTrendingTokens },
      followUps: ['Put $10 into WIF', 'How much money do I have?'],
    }
  }

  if (swapPattern.test(prompt)) {
    const amountMatch = amountPattern.exec(prompt)
    const percentageMatch = percentagePattern.exec(prompt)
    const solHolding = mockHoldings.find((holding) => holding.symbol === 'SOL')
    const solPriceUsd = 154

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
    return {
      text: 'These are the busiest markets right now. Tell me an amount and a side and I will price it.',
      attachment: { kind: 'markets', markets: mockPredictionMarkets },
      followUps: ['Put $2 on YES for the Fed cut', 'How much money do I have?'],
    }
  }

  if (predictionPattern.test(prompt)) {
    const amountMatch = amountPattern.exec(prompt)
    const amountUsd = amountMatch ? Number(amountMatch[1]) : 2
    const outcome = /\bno\b/i.test(prompt) ? 'NO' : 'YES'
    const market = findMarket(prompt)

    return {
      text: `Priced at the current book. Buying ${outcome} costs you the stake up front and pays out if the market resolves your way.`,
      attachment: {
        kind: 'prediction',
        quote: createMockPredictionQuote(market, outcome, amountUsd),
      },
      followUps: ['Show me open markets', 'How much money do I have?'],
    }
  }

  if (balancePattern.test(prompt)) {
    return {
      text: 'Here is where your wallet stands right now.',
      attachment: {
        kind: 'balance',
        totalUsd: mockTotalBalanceUsd,
        holdings: mockHoldings,
      },
      followUps: ['Swap $5 of SOL into USDC', 'What are the hottest memecoins?'],
    }
  }

  return {
    text: 'I can handle balances, swaps, trending tokens, and prediction markets. Try one of these and I will show you exactly what would happen.',
    followUps: defaultFollowUps,
  }
}

function findMarket(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase()

  const titleMatch = mockPredictionMarkets.find((candidate) =>
    normalizedPrompt.includes(candidate.title.toLowerCase()),
  )

  if (titleMatch) {
    return titleMatch
  }

  const categoryMatch = mockPredictionMarkets.find((candidate) =>
    normalizedPrompt.includes(candidate.category.toLowerCase()),
  )

  return categoryMatch ?? mockPredictionMarkets[1]
}
