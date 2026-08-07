import { createHash } from 'node:crypto'

import { z } from 'zod'

import { realtimeSessionRequestSchema } from '../../shared/contracts/api.js'
import { apiError, jsonResponse, parseBody } from '../_lib/http.js'

const openAiSessionSchema = z.union([
  z.object({ value: z.string().min(1) }),
  z.object({ client_secret: z.string().min(1) }),
])

const defaultRealtimeModel = 'gpt-realtime-2.1'
const defaultVoice = 'marin'
const clientSecretTtlSeconds = 60

export async function POST(request: Request): Promise<Response> {
  const parsedRequest = await parseBody(request, realtimeSessionRequestSchema)

  if ('response' in parsedRequest) {
    return parsedRequest.response
  }

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY

  if (!apiKey) {
    return apiError(
      503,
      'OPENAI_NOT_CONFIGURED',
      'Voice is unavailable until OPENAI_API_KEY is configured',
    )
  }

  const safetyIdentifier = createHash('sha256')
    .update(parsedRequest.data.clientId)
    .digest('hex')

  try {
    const response = await fetch(
      'https://api.openai.com/v1/realtime/client_secrets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Safety-Identifier': safetyIdentifier,
        },
        body: JSON.stringify({
          expires_after: {
            anchor: 'created_at',
            seconds: clientSecretTtlSeconds,
          },
          session: {
            type: 'realtime',
            model:
              process.env.OPENAI_REALTIME_MODEL ?? defaultRealtimeModel,
            audio: {
              output: {
                voice: process.env.OPENAI_REALTIME_VOICE ?? defaultVoice,
              },
            },
          },
        }),
      },
    )

    if (!response.ok) {
      return apiError(
        502,
        'OPENAI_SESSION_FAILED',
        'Unable to start a voice session',
        { providerStatus: response.status },
      )
    }

    const session = openAiSessionSchema.safeParse(await response.json())

    if (!session.success) {
      return apiError(
        502,
        'OPENAI_INVALID_RESPONSE',
        'OpenAI returned an invalid voice session',
      )
    }

    return jsonResponse({
      data: {
        clientSecret:
          'value' in session.data
            ? session.data.value
            : session.data.client_secret,
      },
    })
  } catch {
    return apiError(
      502,
      'OPENAI_UNAVAILABLE',
      'Unable to reach the voice service',
    )
  }
}
