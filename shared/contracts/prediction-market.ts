import { z } from 'zod'

export const predictionMarketSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  yesProbability: z.number().min(0).max(1),
  noProbability: z.number().min(0).max(1),
  closesAt: z.string().datetime(),
  isTradingAvailable: z.boolean(),
  isSimulated: z.boolean().optional(),
})

export const predictionMarketsSchema = z.array(predictionMarketSchema)

export type PredictionMarket = z.infer<typeof predictionMarketSchema>
