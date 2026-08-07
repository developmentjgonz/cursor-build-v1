import {
  realtimeSessionSchema,
  type RealtimeSession,
} from '../../../shared/contracts/api'
import { postApi } from '../api-client'

export function createRealtimeSession(
  clientId: string,
): Promise<RealtimeSession> {
  return postApi('/api/realtime/session', { clientId }, realtimeSessionSchema)
}
