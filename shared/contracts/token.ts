import { z } from 'zod'

export const trendingTokenSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  mint: z.string().min(1).optional(),
  priceUsd: z.number().nonnegative(),
  change24hPercentage: z.number(),
  volume24hUsd: z.number().nonnegative(),
  trend: z.array(z.number()).min(2),
})

export const trendingTokensSchema = z.array(trendingTokenSchema)

export type TrendingToken = z.infer<typeof trendingTokenSchema>
