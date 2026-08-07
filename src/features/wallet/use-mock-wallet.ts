import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  mockHoldings,
  mockWalletAddress,
  type WalletHolding,
} from '../../lib/mock/mock-data'

export type WalletStatus = 'disconnected' | 'connecting' | 'connected'

export interface MockWallet {
  status: WalletStatus
  address: string | null
  totalBalanceUsd: number
  holdings: readonly WalletHolding[]
  connect: () => void
  disconnect: () => void
  depositUsd: (amountUsd: number) => void
}

const connectDelayMs = 900

export function useMockWallet(): MockWallet {
  const [status, setStatus] = useState<WalletStatus>('disconnected')
  const [depositedUsd, setDepositedUsd] = useState(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const connect = useCallback(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== 'disconnected') {
        return currentStatus
      }

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setStatus('connected')
      }, connectDelayMs)

      return 'connecting'
    })
  }, [])

  const disconnect = useCallback(() => {
    window.clearTimeout(timeoutRef.current)
    setStatus('disconnected')
  }, [])

  const depositUsd = useCallback((amountUsd: number) => {
    window.clearTimeout(timeoutRef.current)
    setDepositedUsd((currentAmount) => currentAmount + amountUsd)
    setStatus('connected')
  }, [])

  const isConnected = status === 'connected'

  const holdings = useMemo(() => {
    if (!isConnected) {
      return []
    }

    if (depositedUsd === 0) {
      return mockHoldings
    }

    return mockHoldings.map((holding) =>
      holding.symbol === 'USDC'
        ? {
            ...holding,
            amount: holding.amount + depositedUsd,
            valueUsd: holding.valueUsd + depositedUsd,
          }
        : holding,
    )
  }, [depositedUsd, isConnected])

  const totalBalanceUsd = useMemo(
    () => holdings.reduce((total, holding) => total + holding.valueUsd, 0),
    [holdings],
  )

  return {
    status,
    address: isConnected ? mockWalletAddress : null,
    totalBalanceUsd,
    holdings,
    connect,
    disconnect,
    depositUsd,
  }
}
