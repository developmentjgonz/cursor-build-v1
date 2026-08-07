import type {
  PredictionQuote,
  SwapQuote,
} from '../../../shared/contracts/quote'
import { formatProbability, formatUsd } from '../../lib/format'
import type { DiloReply } from './chat-types'

export type TradeQuote = PredictionQuote | SwapQuote

export function explainPredictionQuote(quote: PredictionQuote): string {
  const chance = formatProbability(quote.probability)
  const stake = formatUsd(quote.costUsd)
  const payout = formatUsd(quote.potentialPayoutUsd)
  const profit = formatUsd(Math.max(quote.potentialPayoutUsd - quote.costUsd, 0))

  return `Here’s the call on “${quote.marketTitle}.” You’re buying ${quote.outcome} at about ${chance}. You put in ${stake} now. If you’re right, it pays about ${payout} — that’s roughly ${profit} profit. If you’re wrong, that ${stake} is gone. Want me to place this demo trade?`
}

export function explainSwapQuote(quote: SwapQuote): string {
  return `Here’s the swap: ${quote.inputAmount.toPrecision(3)} ${quote.inputToken} for about ${quote.expectedOutputAmount.toFixed(2)} ${quote.outputToken}. Want me to place this demo trade?`
}

export function buildTradeCelebration(quote: TradeQuote): DiloReply {
  if (quote.kind === 'prediction') {
    const stake = formatUsd(quote.costUsd)
    const payout = formatUsd(quote.potentialPayoutUsd)

    return {
      text: `Congrats — demo trade placed. You’re on ${quote.outcome} for “${quote.marketTitle}” with ${stake} in. If it hits, you’re looking at about ${payout} back. Nothing real moved; this is a practice fill.`,
      followUps: [
        'Show me open markets',
        'What are the hottest memecoins?',
      ],
    }
  }

  return {
    text: `Congrats — demo swap placed. ${quote.inputAmount.toPrecision(3)} ${quote.inputToken} into about ${quote.expectedOutputAmount.toFixed(2)} ${quote.outputToken}. Nothing real moved; this is a practice fill.`,
    followUps: [
      'What are the hottest memecoins?',
      'Show me open markets',
    ],
  }
}

export function isTradeConfirmPrompt(prompt: string): boolean {
  return /^(yes|yeah|yep|yup|ok|okay|sure|confirm|approve|do it|place it|go ahead|lets? do it|let’s do it|dale|claro|sí|si)\b/i.test(
    prompt.trim(),
  )
}
