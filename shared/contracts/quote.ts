import { z } from 'zod'

import { predictionOutcomeSchema } from './intent'

export const swapQuoteSchema = z.object({
  kind: z.literal('swap'),
  inputToken: z.string().min(1),
  outputToken: z.string().min(1),
  inputAmount: z.number().positive(),
  expectedOutputAmount: z.number().positive(),
  minimumOutputAmount: z.number().positive(),
  priceImpactPercentage: z.number().nonnegative(),
  estimatedFeeSol: z.number().nonnegative(),
  route: z.array(z.string().min(1)),
  expiresAt: z.string().datetime(),
})

export const predictionQuoteSchema = z.object({
  kind: z.literal('prediction'),
  marketId: z.string().min(1),
  marketTitle: z.string().min(1),
  outcome: predictionOutcomeSchema,
  probability: z.number().min(0).max(1),
  costUsd: z.number().positive(),
  potentialPayoutUsd: z.number().positive(),
  estimatedFeeSol: z.number().nonnegative(),
  expiresAt: z.string().datetime(),
})

export const quoteSchema = z.discriminatedUnion('kind', [
  swapQuoteSchema,
  predictionQuoteSchema,
])

export type SwapQuote = z.infer<typeof swapQuoteSchema>
export type PredictionQuote = z.infer<typeof predictionQuoteSchema>
export type Quote = z.infer<typeof quoteSchema>
