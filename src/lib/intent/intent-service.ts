import type { InterpretIntentRequest } from '../../../shared/contracts/api'
import { intentSchema, type Intent } from '../../../shared/contracts/intent'
import { postApi } from '../api-client'

export function interpretIntent(
  request: InterpretIntentRequest,
): Promise<Intent> {
  return postApi('/api/intent', request, intentSchema)
}
