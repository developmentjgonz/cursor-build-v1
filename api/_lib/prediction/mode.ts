import { getServerEnv } from '../env'

export interface PredictionMode {
  useLiveIntegration: boolean
  simulatedReason: string | null
}

export function resolvePredictionMode(): PredictionMode {
  const env = getServerEnv()

  if (env.forceSimulated) {
    return {
      useLiveIntegration: false,
      simulatedReason:
        'PREDICTION_MODE=simulated is enabled. Showing simulated markets and quotes.',
    }
  }

  return {
    useLiveIntegration: true,
    simulatedReason: null,
  }
}
