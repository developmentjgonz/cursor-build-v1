/**
 * Shared Realtime session audio settings. Low semantic VAD eagerness cuts
 * false barge-ins from ambient noise while still letting the user jump in.
 */
export const diloRealtimeSessionConfig = {
  audio: {
    input: {
      turnDetection: {
        type: 'semantic_vad' as const,
        eagerness: 'low' as const,
        createResponse: true,
        interruptResponse: true,
      },
    },
  },
}
