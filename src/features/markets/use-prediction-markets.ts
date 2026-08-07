import { useEffect, useState } from 'react'

import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import { searchPredictionMarkets } from '../../lib/prediction/prediction-service'

interface PredictionMarketsState {
  markets: readonly PredictionMarket[]
  isLoading: boolean
  isSimulated: boolean
  message: string | null
  error: string | null
}

const browseQuery = ''

export function usePredictionMarkets(
  query = browseQuery,
): PredictionMarketsState {
  const [markets, setMarkets] = useState<readonly PredictionMarket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulated, setIsSimulated] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadMarkets() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await searchPredictionMarkets({ query })

        if (isCancelled) {
          return
        }

        setMarkets(result.markets)
        setIsSimulated(result.isSimulated)
        setMessage(result.message)
      } catch (loadError) {
        if (isCancelled) {
          return
        }

        setMarkets([])
        setIsSimulated(true)
        setMessage(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load markets',
        )
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadMarkets()

    return () => {
      isCancelled = true
    }
  }, [query])

  return {
    markets,
    isLoading,
    isSimulated,
    message,
    error,
  }
}
