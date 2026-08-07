import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { interpretIntentRequestSchema } from '../shared/contracts/api'
import { intentSchema, type Intent } from '../shared/contracts/intent'
import { apiError, jsonResponse, parseBody } from './_lib/http'

const parsedSwapIntentSchema = z.object({
  kind: z.literal('swap'),
  inputToken: z.string().trim().min(1),
  outputToken: z.string().trim().min(1),
  amount: z.number().positive().nullable(),
  walletPercentage: z.number().positive().max(100).nullable(),
  maximumPriceImpactPercentage: z.number().nonnegative().nullable(),
})

const parsedPredictionIntentSchema = z.object({
  kind: z.literal('prediction'),
  marketQuery: z.string().trim().min(1),
  outcome: z.union([z.literal('YES'), z.literal('NO')]),
  amountUsd: z.number().positive(),
})

const parsedIntentResponseSchema = z.object({
  intent: z.discriminatedUnion('kind', [
    parsedSwapIntentSchema,
    parsedPredictionIntentSchema,
  ]),
})

const defaultIntentModel = 'gpt-5.6'
const intentInstructions = `You interpret English and Spanish financial requests for Dilo.
Return only a swap or prediction intent.
For swaps, preserve token symbols and convert them to uppercase.
For swaps, exactly one of amount or walletPercentage must be non-null.
An amount is denominated in the input token unless the user explicitly specifies a wallet percentage.
Only include maximumPriceImpactPercentage when the user states that condition.
Never invent an amount, token, market, outcome, or condition.`

function normalizeIntent(
  parsedIntent: z.infer<typeof parsedIntentResponseSchema>['intent'],
): Intent {
  if (parsedIntent.kind === 'prediction') {
    return intentSchema.parse(parsedIntent)
  }

  return intentSchema.parse({
    kind: parsedIntent.kind,
    inputToken: parsedIntent.inputToken,
    outputToken: parsedIntent.outputToken,
    ...(parsedIntent.amount === null ? {} : { amount: parsedIntent.amount }),
    ...(parsedIntent.walletPercentage === null
      ? {}
      : { walletPercentage: parsedIntent.walletPercentage }),
    ...(parsedIntent.maximumPriceImpactPercentage === null
      ? {}
      : {
          maximumPriceImpactPercentage:
            parsedIntent.maximumPriceImpactPercentage,
        }),
  })
}

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, interpretIntentRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY

  if (!apiKey) {
    return apiError(
      503,
      'OPENAI_NOT_CONFIGURED',
      'Intent interpretation is unavailable until OPENAI_API_KEY is configured',
    )
  }

  try {
    const openAi = new OpenAI({ apiKey })
    const response = await openAi.responses.parse({
      model: process.env.OPENAI_INTENT_MODEL ?? defaultIntentModel,
      instructions: intentInstructions,
      input: parsedRequest.data.prompt,
      text: {
        format: zodTextFormat(
          parsedIntentResponseSchema,
          'financial_intent',
        ),
      },
    })

    if (!response.output_parsed) {
      return apiError(
        422,
        'INTENT_NOT_UNDERSTOOD',
        'Dilo could not identify a complete financial intent',
      )
    }

    return jsonResponse({
      data: normalizeIntent(response.output_parsed.intent),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(
        422,
        'INVALID_INTENT',
        'The request is missing required financial details',
        error.flatten(),
      )
    }

    return apiError(
      502,
      'OPENAI_INTENT_FAILED',
      'Unable to interpret the request right now',
    )
  }
}
