import type { ZodType } from 'zod'

import { apiFailureSchema } from '../../shared/contracts/api'

export async function postApi<T>(
  path: string,
  body: unknown,
  schema: ZodType<T>,
): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const responseBody: unknown = await response.json()

  if (!response.ok) {
    const failure = apiFailureSchema.safeParse(responseBody)
    throw new Error(
      failure.success ? failure.data.error.message : 'API request failed',
    )
  }

  const payload = schema.safeParse(
    typeof responseBody === 'object' &&
      responseBody !== null &&
      'data' in responseBody
      ? responseBody.data
      : undefined,
  )

  if (!payload.success) {
    throw new Error('API returned an invalid response')
  }

  return payload.data
}
