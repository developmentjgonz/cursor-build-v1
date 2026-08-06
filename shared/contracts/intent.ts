import { z } from 'zod'

const tokenSymbolSchema = z.string().trim().min(1).transform((symbol) => symbol.toUpperCase())

export const swapIntentSchema = z
  .object({
    kind: z.literal('swap'),
    inputToken: tokenSymbolSchema,
    outputToken: tokenSymbolSchema,
    amount: z.number().positive().optional(),
    walletPercentage: z.number().positive().max(100).optional(),
    maximumPriceImpactPercentage: z.number().nonnegative().optional(),
  })
  .refine(
    ({ amount, walletPercentage }) =>
      (amount === undefined) !== (walletPercentage === undefined),
    {
      message: 'Provide either amount or walletPercentage',
      path: ['amount'],
    },
  )

export const predictionOutcomeSchema = z.union([
  z.literal('YES'),
  z.literal('NO'),
])

export const predictionIntentSchema = z.object({
  kind: z.literal('prediction'),
  marketQuery: z.string().trim().min(1),
  outcome: predictionOutcomeSchema,
  amountUsd: z.number().positive(),
})

export const intentSchema = z.discriminatedUnion('kind', [
  swapIntentSchema,
  predictionIntentSchema,
])

export type SwapIntent = z.infer<typeof swapIntentSchema>
export type PredictionOutcome = z.infer<typeof predictionOutcomeSchema>
export type PredictionIntent = z.infer<typeof predictionIntentSchema>
export type Intent = z.infer<typeof intentSchema>
