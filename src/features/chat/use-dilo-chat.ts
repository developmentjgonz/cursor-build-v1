import { useCallback, useEffect, useRef, useState } from 'react'

import type { TrendingToken } from '../../../shared/contracts/token'
import type {
  MockTradeQuote,
  MockTradeResult,
  MockWalletSnapshot,
} from '../wallet/use-mock-wallet'
import type { ChatMessage, DiloReply } from './chat-types'
import { createDiloReply } from './mock-dilo-brain'
import {
  buildTradeCelebration,
  isTradeConfirmPrompt,
  type TradeQuote,
} from './mock-trade'

const thinkingDelayMs = 850

function createMessageId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function extractTradeQuote(reply: DiloReply): TradeQuote | null {
  if (
    reply.attachment?.kind === 'prediction' ||
    reply.attachment?.kind === 'swap'
  ) {
    return reply.attachment.quote
  }

  return null
}

export interface DiloChat {
  messages: readonly ChatMessage[]
  followUps: readonly string[]
  isThinking: boolean
  sendMessage: (prompt: string) => void
  receiveVoiceReply: (prompt: string, reply: DiloReply) => void
  receiveVoiceTokens: (
    prompt: string,
    tokens: readonly TrendingToken[],
    summary: string,
  ) => void
  confirmPendingTrade: () => void
}

interface UseDiloChatOptions {
  getWalletSnapshot: () => MockWalletSnapshot
  applyConfirmedTrade: (quote: MockTradeQuote) => MockTradeResult
}

export function useDiloChat({
  getWalletSnapshot,
  applyConfirmedTrade,
}: UseDiloChatOptions): DiloChat {
  // The thread starts empty so the chat surface can greet with its own empty
  // state and starter prompts instead of a lone welcome bubble.
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [followUps, setFollowUps] = useState<readonly string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const pendingTradeRef = useRef<TradeQuote | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const appendExchange = useCallback((prompt: string, reply: DiloReply) => {
    // A non-trade reply (including a congrats) clears any pending quote.
    pendingTradeRef.current = extractTradeQuote(reply)

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId(),
        author: 'user',
        text: prompt,
        createdAt: Date.now(),
      },
      {
        id: createMessageId(),
        author: 'dilo',
        text: reply.text,
        attachment: reply.attachment,
        createdAt: Date.now(),
      },
    ])
    setFollowUps(reply.followUps)
    setIsThinking(false)
  }, [])

  const confirmPendingTrade = useCallback(() => {
    const pending = pendingTradeRef.current
    if (!pending) {
      return
    }

    const tradeResult = applyConfirmedTrade(pending)
    pendingTradeRef.current = null

    if (!tradeResult.isApplied) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          author: 'dilo',
          text: tradeResult.message,
          createdAt: Date.now(),
        },
      ])
      setFollowUps(['How much money do I have?', 'Try a smaller amount'])
      setIsThinking(false)
      return
    }

    const celebration = buildTradeCelebration(pending)
    const balanceText = ` Your demo balance is now $${tradeResult.snapshot.totalBalanceUsd.toFixed(2)}.`

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId(),
        author: 'dilo',
        text: `${celebration.text}${balanceText}`,
        attachment: celebration.attachment,
        createdAt: Date.now(),
      },
    ])
    setFollowUps(celebration.followUps)
    setIsThinking(false)
  }, [applyConfirmedTrade])

  const sendMessage = useCallback(
    (prompt: string) => {
      const trimmedPrompt = prompt.trim()

      if (!trimmedPrompt) {
        return
      }

      if (pendingTradeRef.current && isTradeConfirmPrompt(trimmedPrompt)) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createMessageId(),
            author: 'user',
            text: trimmedPrompt,
            createdAt: Date.now(),
          },
        ])
        setFollowUps([])
        setIsThinking(true)

        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(() => {
          confirmPendingTrade()
        }, 500)
        return
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          author: 'user',
          text: trimmedPrompt,
          createdAt: Date.now(),
        },
      ])
      setFollowUps([])
      setIsThinking(true)

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        void createDiloReply(trimmedPrompt, getWalletSnapshot()).then((reply) => {
          pendingTradeRef.current = extractTradeQuote(reply)

          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: createMessageId(),
              author: 'dilo',
              text: reply.text,
              attachment: reply.attachment,
              createdAt: Date.now(),
            },
          ])
          setFollowUps(reply.followUps)
          setIsThinking(false)
        })
      }, thinkingDelayMs)
    },
    [confirmPendingTrade, getWalletSnapshot],
  )

  const receiveVoiceReply = useCallback(
    (prompt: string, reply: DiloReply) => {
      appendExchange(prompt, reply)
    },
    [appendExchange],
  )

  const receiveVoiceTokens = useCallback(
    (
      prompt: string,
      tokens: readonly TrendingToken[],
      summary: string,
    ) => {
      receiveVoiceReply(prompt, {
        text: summary,
        attachment: { kind: 'tokens', tokens },
        followUps: tokens.some((token) => token.symbol === 'SOL')
          ? ['What are the hottest memecoins?', 'Swap $5 of SOL into USDC']
          : ['What is the price of SOL?', 'Put $10 into WIF'],
      })
    },
    [receiveVoiceReply],
  )

  return {
    messages,
    followUps,
    isThinking,
    sendMessage,
    receiveVoiceReply,
    receiveVoiceTokens,
    confirmPendingTrade,
  }
}
