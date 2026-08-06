import type { ZodType } from 'zod'

import type { ApiFailure, ApiResponse } from '../../shared/contracts/api'

interface ParsedBody<T> {
  data: T
}

interface InvalidBody {
  response: Response
}

export function jsonResponse<T>(
  body: ApiResponse<T>,
  status = 200,
): Response {
  return Response.json(body, { status })
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  const body: ApiFailure = {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  }

  return jsonResponse(body, status)
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<ParsedBody<T> | InvalidBody> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return {
      response: apiError(400, 'INVALID_JSON', 'Request body must be valid JSON'),
    }
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    return {
      response: apiError(
        400,
        'INVALID_REQUEST',
        'Request body failed validation',
        result.error.flatten(),
      ),
    }
  }

  return { data: result.data }
}

export function notImplemented(integration: string): Response {
  return apiError(
    501,
    'INTEGRATION_NOT_CONFIGURED',
    `${integration} integration is not configured`,
  )
}
