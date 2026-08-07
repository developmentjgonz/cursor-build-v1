import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  mockHoldings,
  mockWalletAddress,
  type WalletHolding,
} from '../../lib/mock/mock-data'

export type WalletStatus =
  | 'disconnected'
  | 'creating'
  | 'connecting'
  | 'connected'

export interface MockWallet {
  status: WalletStatus
  address: string | null
  totalBalanceUsd: number
  holdings: readonly WalletHolding[]
  createWallet: () => void
  connect: () => void
  disconnect: () => void
  depositUsd: (amountUsd: number) => void
}

const connectDelayMs = 900
const createDelayMs = 1400
const base58Alphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function createMockSolanaAddress(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)

  let address = ''
  for (const byte of bytes) {
    address += base58Alphabet[byte % base58Alphabet.length]
  }

  return address.slice(0, 44)
}

export function useMockWallet(): MockWallet {
  const [status, setStatus] = useState<WalletStatus>('disconnected')
  const [address, setAddress] = useState<string | null>(null)
  const [depositedUsd, setDepositedUsd] = useState(0)
  const [isFreshWallet, setIsFreshWallet] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const createWallet = useCallback(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== 'disconnected') {
        return currentStatus
      }

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setAddress(createMockSolanaAddress())
        setIsFreshWallet(true)
        setDepositedUsd(0)
        setStatus('connected')
      }, createDelayMs)

      return 'creating'
    })
  }, [])

  const connect = useCallback(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== 'disconnected') {
        return currentStatus
      }

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setAddress(mockWalletAddress)
        setIsFreshWallet(false)
        setStatus('connected')
      }, connectDelayMs)

      return 'connecting'
    })
  }, [])

  const disconnect = useCallback(() => {
    window.clearTimeout(timeoutRef.current)
    setStatus('disconnected')
    setAddress(null)
    setDepositedUsd(0)
    setIsFreshWallet(false)
  }, [])

  const depositUsd = useCallback((amountUsd: number) => {
    window.clearTimeout(timeoutRef.current)
    setDepositedUsd((currentAmount) => currentAmount + amountUsd)
    setAddress((currentAddress) => currentAddress ?? createMockSolanaAddress())
    setIsFreshWallet(false)
    setStatus('connected')
  }, [])

  const isConnected = status === 'connected'

  const holdings = useMemo(() => {
    if (!isConnected) {
      return []
    }

    // A freshly created wallet starts empty until the user funds it.
    if (isFreshWallet && depositedUsd === 0) {
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
  }, [depositedUsd, isConnected, isFreshWallet])

  const totalBalanceUsd = useMemo(
    () => holdings.reduce((total, holding) => total + holding.valueUsd, 0),
    [holdings],
  )

  return {
    status,
    address: isConnected ? address : null,
    totalBalanceUsd,
    holdings,
    createWallet,
    connect,
    disconnect,
    depositUsd,
  }
}
