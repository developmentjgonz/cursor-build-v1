import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
  PredictionQuote,
  SwapQuote,
} from '../../../shared/contracts/quote'
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

export interface MockWalletSnapshot {
  isConnected: boolean
  address: string | null
  totalBalanceUsd: number
  holdings: readonly WalletHolding[]
}

export interface MockTradeResult {
  isApplied: boolean
  message: string
  snapshot: MockWalletSnapshot
}

export type MockTradeQuote = PredictionQuote | SwapQuote

export interface MockWallet {
  status: WalletStatus
  address: string | null
  totalBalanceUsd: number
  holdings: readonly WalletHolding[]
  createWallet: () => void
  connect: () => void
  disconnect: () => void
  depositUsd: (amountUsd: number) => void
  getSnapshot: () => MockWalletSnapshot
  applyConfirmedTrade: (quote: MockTradeQuote) => MockTradeResult
}

const connectDelayMs = 900
const createDelayMs = 1400
const base58Alphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const tokenNames: Record<string, string> = {
  SOL: 'Solana',
  USDC: 'USD Coin',
  BONK: 'Bonk',
  WIF: 'dogwifhat',
  POPCAT: 'Popcat',
  MEW: 'cat in a dogs world',
}

function cloneHoldings(
  holdings: readonly WalletHolding[],
): readonly WalletHolding[] {
  return holdings.map((holding) => ({ ...holding }))
}

function getTotalBalanceUsd(holdings: readonly WalletHolding[]): number {
  return holdings.reduce((total, holding) => total + holding.valueUsd, 0)
}

function createSnapshot(
  isConnected: boolean,
  address: string | null,
  holdings: readonly WalletHolding[],
): MockWalletSnapshot {
  return {
    isConnected,
    address: isConnected ? address : null,
    totalBalanceUsd: getTotalBalanceUsd(holdings),
    holdings: cloneHoldings(holdings),
  }
}

function debitHolding(
  holdings: readonly WalletHolding[],
  symbol: string,
  amount: number,
): readonly WalletHolding[] | null {
  const normalizedSymbol = symbol.toUpperCase()
  const holding = holdings.find(
    (candidate) => candidate.symbol === normalizedSymbol,
  )

  if (!holding || holding.amount + Number.EPSILON < amount) {
    return null
  }

  const unitPriceUsd =
    holding.amount > 0 ? holding.valueUsd / holding.amount : 0

  return holdings
    .map((candidate) =>
      candidate.symbol === normalizedSymbol
        ? {
            ...candidate,
            amount: Math.max(candidate.amount - amount, 0),
            valueUsd: Math.max(
              candidate.valueUsd - amount * unitPriceUsd,
              0,
            ),
          }
        : candidate,
    )
    .filter((candidate) => candidate.amount > Number.EPSILON)
}

function creditHolding(
  holdings: readonly WalletHolding[],
  symbol: string,
  amount: number,
  valueUsd: number,
): readonly WalletHolding[] {
  const normalizedSymbol = symbol.toUpperCase()
  const hasHolding = holdings.some(
    (holding) => holding.symbol === normalizedSymbol,
  )

  if (!hasHolding) {
    return [
      ...holdings,
      {
        symbol: normalizedSymbol,
        name: tokenNames[normalizedSymbol] ?? normalizedSymbol,
        amount,
        valueUsd,
        change24hPercentage: 0,
      },
    ]
  }

  return holdings.map((holding) =>
    holding.symbol === normalizedSymbol
      ? {
          ...holding,
          amount: holding.amount + amount,
          valueUsd: holding.valueUsd + valueUsd,
        }
      : holding,
  )
}

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
  const [holdings, setHoldings] = useState<readonly WalletHolding[]>([])
  const statusRef = useRef<WalletStatus>('disconnected')
  const addressRef = useRef<string | null>(null)
  const holdingsRef = useRef<readonly WalletHolding[]>([])
  const timeoutRef = useRef<number | undefined>(undefined)

  const updateStatus = useCallback((nextStatus: WalletStatus) => {
    statusRef.current = nextStatus
    setStatus(nextStatus)
  }, [])

  const updateAddress = useCallback((nextAddress: string | null) => {
    addressRef.current = nextAddress
    setAddress(nextAddress)
  }, [])

  const updateHoldings = useCallback(
    (nextHoldings: readonly WalletHolding[]) => {
      holdingsRef.current = nextHoldings
      setHoldings(nextHoldings)
    },
    [],
  )

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
        updateAddress(createMockSolanaAddress())
        updateHoldings([])
        updateStatus('connected')
      }, createDelayMs)

      statusRef.current = 'creating'
      return 'creating'
    })
  }, [updateAddress, updateHoldings, updateStatus])

  const connect = useCallback(() => {
    setStatus((currentStatus) => {
      if (currentStatus !== 'disconnected') {
        return currentStatus
      }

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        updateAddress(mockWalletAddress)
        updateHoldings(cloneHoldings(mockHoldings))
        updateStatus('connected')
      }, connectDelayMs)

      statusRef.current = 'connecting'
      return 'connecting'
    })
  }, [updateAddress, updateHoldings, updateStatus])

  const disconnect = useCallback(() => {
    window.clearTimeout(timeoutRef.current)
    updateStatus('disconnected')
    updateAddress(null)
    updateHoldings([])
  }, [updateAddress, updateHoldings, updateStatus])

  const depositUsd = useCallback((amountUsd: number) => {
    window.clearTimeout(timeoutRef.current)
    const nextAddress = addressRef.current ?? createMockSolanaAddress()
    const nextHoldings = creditHolding(
      holdingsRef.current,
      'USDC',
      amountUsd,
      amountUsd,
    )

    updateAddress(nextAddress)
    updateHoldings(nextHoldings)
    updateStatus('connected')
  }, [updateAddress, updateHoldings, updateStatus])

  const isConnected = status === 'connected'

  const totalBalanceUsd = useMemo(
    () => getTotalBalanceUsd(holdings),
    [holdings],
  )

  const getSnapshot = useCallback(
    () =>
      createSnapshot(
        statusRef.current === 'connected',
        addressRef.current,
        holdingsRef.current,
      ),
    [],
  )

  const applyConfirmedTrade = useCallback(
    (quote: MockTradeQuote): MockTradeResult => {
      const currentSnapshot = getSnapshot()

      if (!currentSnapshot.isConnected) {
        return {
          isApplied: false,
          message: 'Connect a wallet before confirming a demo trade.',
          snapshot: currentSnapshot,
        }
      }

      if (quote.kind === 'prediction') {
        const nextHoldings = debitHolding(
          holdingsRef.current,
          'USDC',
          quote.costUsd,
        )

        if (!nextHoldings) {
          return {
            isApplied: false,
            message: `Your demo wallet does not have enough USDC for this ${quote.costUsd.toFixed(2)} USDC position.`,
            snapshot: currentSnapshot,
          }
        }

        updateHoldings(nextHoldings)
        return {
          isApplied: true,
          message: 'Demo prediction position confirmed.',
          snapshot: createSnapshot(true, addressRef.current, nextHoldings),
        }
      }

      const inputHolding = holdingsRef.current.find(
        (holding) => holding.symbol === quote.inputToken.toUpperCase(),
      )
      const inputValueUsd =
        inputHolding && inputHolding.amount > 0
          ? (inputHolding.valueUsd / inputHolding.amount) * quote.inputAmount
          : quote.inputToken.toUpperCase() === 'USDC'
            ? quote.inputAmount
            : 0
      const debitedHoldings = debitHolding(
        holdingsRef.current,
        quote.inputToken,
        quote.inputAmount,
      )

      if (!debitedHoldings) {
        return {
          isApplied: false,
          message: `Your demo wallet does not have enough ${quote.inputToken} for this swap.`,
          snapshot: currentSnapshot,
        }
      }

      const nextHoldings = creditHolding(
        debitedHoldings,
        quote.outputToken,
        quote.expectedOutputAmount,
        inputValueUsd,
      )
      updateHoldings(nextHoldings)

      return {
        isApplied: true,
        message: 'Demo swap confirmed.',
        snapshot: createSnapshot(true, addressRef.current, nextHoldings),
      }
    },
    [getSnapshot, updateHoldings],
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
    getSnapshot,
    applyConfirmedTrade,
  }
}
