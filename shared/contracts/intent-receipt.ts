import { z } from 'zod'

import { intentSchema } from './intent.js'
import { quoteSchema } from './quote.js'

export const intentReceiptSchema = z.object({
  id: z.string().min(1),
  intent: intentSchema,
  quote: quoteSchema,
  actionSummary: z.string().min(1),
  warnings: z.array(z.string()),
  blockingReasons: z.array(z.string()),
  createdAt: z.string().datetime(),
})

export type IntentReceipt = z.infer<typeof intentReceiptSchema>
