import { z } from 'zod'

import { swapIntentSchema } from './intent'
import { predictionQuoteSchema, swapQuoteSchema } from './quote'

const walletAddressSchema = z.string().trim().min(32).max(44)

export const interpretIntentRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(1_000),
  walletAddress: walletAddressSchema.optional(),
})

export const swapQuoteRequestSchema = z.object({
  intent: swapIntentSchema,
  walletAddress: walletAddressSchema,
})

export const buildSwapTransactionRequestSchema = z.object({
  walletAddress: walletAddressSchema,
  quote: swapQuoteSchema,
})

export const predictionMarketsRequestSchema = z.object({
  query: z.string().trim().min(1).max(300),
})

export const buildPredictionTransactionRequestSchema = z.object({
  walletAddress: walletAddressSchema,
  quote: predictionQuoteSchema,
})

export const serializedTransactionSchema = z.object({
  transactionBase64: z.string().min(1),
  lastValidBlockHeight: z.number().int().positive(),
})

export const apiFailureSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export interface ApiSuccess<T> {
  data: T
}

export interface ApiFailure {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type InterpretIntentRequest = z.infer<typeof interpretIntentRequestSchema>
export type SwapQuoteRequest = z.infer<typeof swapQuoteRequestSchema>
export type BuildSwapTransactionRequest = z.infer<
  typeof buildSwapTransactionRequestSchema
>
export type PredictionMarketsRequest = z.infer<
  typeof predictionMarketsRequestSchema
>
export type BuildPredictionTransactionRequest = z.infer<
  typeof buildPredictionTransactionRequestSchema
>
export type SerializedTransaction = z.infer<typeof serializedTransactionSchema>
