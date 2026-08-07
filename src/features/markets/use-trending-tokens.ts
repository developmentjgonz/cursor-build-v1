import { useEffect, useState } from 'react'

import type { TrendingToken } from '../../../shared/contracts/token'
import { fetchTrendingTokens } from '../../lib/tokens/token-service'

interface TrendingTokensState {
  tokens: readonly TrendingToken[]
  isLoading: boolean
  isSimulated: boolean
  message: string | null
  error: string | null
}

export function useTrendingTokens(): TrendingTokensState {
  const [tokens, setTokens] = useState<readonly TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulated, setIsSimulated] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadTokens() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchTrendingTokens()

        if (isCancelled) {
          return
        }

        setTokens(result.tokens)
        setIsSimulated(result.isSimulated)
        setMessage(result.message)
      } catch (loadError) {
        if (isCancelled) {
          return
        }

        setTokens([])
        setIsSimulated(true)
        setMessage(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load trending tokens',
        )
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTokens()

    return () => {
      isCancelled = true
    }
  }, [])

  return {
    tokens,
    isLoading,
    isSimulated,
    message,
    error,
  }
}
