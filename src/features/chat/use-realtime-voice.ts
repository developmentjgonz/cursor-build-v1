import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import type { TrendingToken } from '../../../shared/contracts/token'
import { interpretIntent } from '../../lib/intent/intent-service'
import {
  fetchTokenPrices,
  fetchTrendingTokens,
} from '../../lib/tokens/token-service'
import { createRealtimeSession } from '../../lib/voice/realtime-service'
import type {
  MockTradeQuote,
  MockTradeResult,
  MockWalletSnapshot,
} from '../wallet/use-mock-wallet'
import type { DiloReply } from './chat-types'
import { diloPersona } from './dilo-persona'
import {
  buildTradeCelebration,
  type TradeQuote,
} from './mock-trade'
import {
  prepareMarketsReply,
  prepareTradeReply,
} from './prepare-trade-reply'

export type RealtimeVoiceStatus =
  | 'disconnected'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'

interface VoiceSession {
  close: () => void
}

export interface RealtimeVoice {
  status: RealtimeVoiceStatus
  errorMessage: string | null
  isSupported: boolean
  start: () => Promise<void>
  stop: () => void
}

interface FinancialVoiceOptions {
  mode?: 'financial'
  getWalletSnapshot: () => MockWalletSnapshot
  applyConfirmedTrade: (quote: MockTradeQuote) => MockTradeResult
  /** When true, Dilo speaks a short greeting as soon as the session connects. */
  greetOnStart?: boolean
  /** Optional: only used when a tool is called with showInChat true. */
  onTradePrepared?: (prompt: string, reply: DiloReply) => void
  onMarketsQuoted?: (prompt: string, reply: DiloReply) => void
  onTokensQuoted?: (
    prompt: string,
    tokens: readonly TrendingToken[],
    summary: string,
  ) => void
  onTradeCompleted?: (prompt: string, reply: DiloReply) => void
}

interface OnboardingVoiceOptions {
  mode: 'onboarding'
  onCreateWallet: () => void
  onUseExistingWallet: () => void
}

type UseRealtimeVoiceOptions = FinancialVoiceOptions | OnboardingVoiceOptions

const showInChatParameter = z
  .boolean()
  .optional()
  .describe(
    'True only if the user asked to see it on screen or in chat. Omit or false to keep this conversational and spoken.',
  )

const financialIntentParameters = z.object({
  prompt: z
    .string()
    .trim()
    .min(1)
    .describe('The user’s exact swap or prediction-market request'),
  showInChat: showInChatParameter,
})

const tokenPriceParameters = z.object({
  symbols: z
    .array(z.enum(['SOL', 'WIF', 'BONK', 'POPCAT', 'MEW']))
    .min(1)
    .max(5)
    .describe('Token symbols to price live'),
  prompt: z
    .string()
    .trim()
    .min(1)
    .describe('The user’s exact price question'),
  showInChat: showInChatParameter,
})

const trendingTokensParameters = z.object({
  prompt: z
    .string()
    .trim()
    .min(1)
    .describe('The user’s exact trending/memecoin question'),
  showInChat: showInChatParameter,
})

const predictionMarketsParameters = z.object({
  query: z
    .string()
    .trim()
    .max(300)
    .describe(
      'Topic to search, like bitcoin, Fed, Trump, or NBA. Use an empty string to list open markets.',
    ),
  prompt: z
    .string()
    .trim()
    .min(1)
    .describe('The user’s exact market browse question'),
  showInChat: showInChatParameter,
})

const agentInstructions = `${diloPersona}

# Your job right now

The user is talking to you. Voice-first: explain options out loud. Do not push cards, lists, or receipts on screen unless they clearly ask to see them in chat.

- Open with what they want to trade today — memecoins or a call they have in mind.
- When they ask about prediction markets or a topic’s odds, call search_prediction_markets with showInChat false. Speak 1–2 market options conversationally: the question, YES vs NO, about what a couple bucks would pay back either way. Then ask which side they want.
- When they pick a side and amount, call prepare_financial_intent with showInChat false. Explain stake, chance, and payout in plain talk. Ask if they want to confirm the trade.
- When they say yes / confirm / do it / place it, call confirm_mock_trade. Celebrate briefly and say the trade request is confirmed without claiming funds moved.
- For balance, holdings, portfolio, or “how much is left” questions, always call get_wallet_balance. Clearly call it a demo balance.
- Prices / trending memecoins: call the price tools with showInChat false and speak the numbers. No lists.
- Only set showInChat true if they say things like “show me,” “put it on screen,” or “open chat.”
- Never invent prices, odds, or quotes. If a tool fails, say the feed is not available right now.`

const onboardingAgentInstructions = `${diloPersona}

# Your job right now

You are meeting a first-time user. Get them set up fast so they can start trading.

- Introduce yourself in one line, then ask if they want you to create a wallet or if they already have one.
- If they want a new one, call create_wallet. If they already have one, call use_existing_wallet.`

function supportsRealtimeVoice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof RTCPeerConnection !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  )
}

export function useRealtimeVoice(
  options: UseRealtimeVoiceOptions,
): RealtimeVoice {
  const [status, setStatus] =
    useState<RealtimeVoiceStatus>('disconnected')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const sessionRef = useRef<VoiceSession | null>(null)
  const isStartingRef = useRef(false)
  const isMountedRef = useRef(true)
  const startGenerationRef = useRef(0)
  const optionsRef = useRef(options)
  const pendingTradeRef = useRef<TradeQuote | null>(null)
  const isSupported = supportsRealtimeVoice()

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const stop = useCallback(() => {
    startGenerationRef.current += 1
    sessionRef.current?.close()
    sessionRef.current = null
    isStartingRef.current = false
    setStatus('disconnected')
    setErrorMessage(null)
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      startGenerationRef.current += 1
      sessionRef.current?.close()
      sessionRef.current = null
      isStartingRef.current = false
    }
  }, [])

  const start = useCallback(async () => {
    if (!isSupported || sessionRef.current || isStartingRef.current) {
      return
    }

    const startGeneration = startGenerationRef.current + 1
    startGenerationRef.current = startGeneration
    isStartingRef.current = true
    setStatus('connecting')
    setErrorMessage(null)

    try {
      const [{ RealtimeAgent, RealtimeSession, tool }, sessionCredentials] =
        await Promise.all([
          import('@openai/agents/realtime'),
          createRealtimeSession(crypto.randomUUID()),
        ])

      if (
        !isMountedRef.current ||
        startGeneration !== startGenerationRef.current
      ) {
        isStartingRef.current = false
        return
      }

      const isOnboarding = optionsRef.current.mode === 'onboarding'
      const tools = isOnboarding
        ? [
            tool({
              name: 'create_wallet',
              description:
                'Continue onboarding by creating a new self-custody wallet.',
              parameters: z.object({}),
              async execute() {
                const currentOptions = optionsRef.current

                if (currentOptions.mode === 'onboarding') {
                  window.setTimeout(currentOptions.onCreateWallet, 0)
                }

                return 'Opening the wallet setup.'
              },
            }),
            tool({
              name: 'use_existing_wallet',
              description:
                'Finish onboarding by connecting the user’s existing wallet.',
              parameters: z.object({}),
              async execute() {
                const currentOptions = optionsRef.current

                if (currentOptions.mode === 'onboarding') {
                  window.setTimeout(currentOptions.onUseExistingWallet, 0)
                }

                return 'Opening the existing wallet connection.'
              },
            }),
          ]
        : [
            tool({
              name: 'get_wallet_balance',
              description:
                'Read the current in-memory demo wallet balance and holdings. Use for balance, portfolio, holdings, and how-much-is-left questions.',
              parameters: z.object({}),
              async execute() {
                const currentOptions = optionsRef.current

                if (currentOptions.mode === 'onboarding') {
                  return JSON.stringify({
                    ok: false,
                    error: 'The demo wallet is not available during onboarding.',
                  })
                }

                const snapshot = currentOptions.getWalletSnapshot()

                if (!snapshot.isConnected) {
                  return JSON.stringify({
                    ok: false,
                    error: 'Connect the demo wallet first.',
                    speak:
                      'Your demo wallet is not connected yet. Connect it and I can read the balance.',
                  })
                }

                const holdings = snapshot.holdings.map((holding) => ({
                  symbol: holding.symbol,
                  amount: holding.amount,
                  valueUsd: holding.valueUsd,
                }))
                const holdingSummary =
                  holdings.length === 0
                    ? 'It is empty.'
                    : holdings
                        .map(
                          (holding) =>
                            `${holding.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${holding.symbol}, worth about $${holding.valueUsd.toFixed(2)}`,
                        )
                        .join('; ')

                return JSON.stringify({
                  ok: true,
                  isDemo: true,
                  totalBalanceUsd: snapshot.totalBalanceUsd,
                  holdings,
                  speak: `Your demo balance is $${snapshot.totalBalanceUsd.toFixed(2)}. ${holdingSummary}`,
                })
              },
            }),
            tool({
              name: 'get_token_prices',
              description:
                'Fetch live USD prices for SOL or curated Solana memecoins. Speak the numbers; keep showInChat false unless they ask to see chat.',
              parameters: tokenPriceParameters,
              async execute({ symbols, prompt, showInChat }) {
                try {
                  const result = await fetchTokenPrices({ symbols })
                  const currentOptions = optionsRef.current
                  const summary =
                    result.tokens.length === 0
                      ? 'No live prices found for those symbols.'
                      : result.tokens
                          .map(
                            (token) =>
                              `${token.symbol} ${formatSpokenPrice(token.priceUsd)} (${formatSpokenChange(token.change24hPercentage)} in 24h)`,
                          )
                          .join('; ')

                  if (
                    showInChat &&
                    currentOptions.mode !== 'onboarding' &&
                    result.tokens.length > 0
                  ) {
                    currentOptions.onTokensQuoted?.(
                      prompt,
                      result.tokens,
                      summary,
                    )
                  }

                  return JSON.stringify({
                    ok: result.tokens.length > 0,
                    isSimulated: result.isSimulated,
                    message: result.message,
                    tokens: result.tokens.map((token) => ({
                      symbol: token.symbol,
                      name: token.name,
                      priceUsd: token.priceUsd,
                      change24hPercentage: token.change24hPercentage,
                    })),
                    speak: summary,
                  })
                } catch (error) {
                  return JSON.stringify({
                    ok: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Unable to fetch live prices',
                  })
                }
              },
            }),
            tool({
              name: 'get_trending_memecoins',
              description:
                'Fetch live trending Solana memecoin prices for a spoken highlight. Keep showInChat false unless they ask to see chat.',
              parameters: trendingTokensParameters,
              async execute({ prompt, showInChat }) {
                try {
                  const result = await fetchTrendingTokens()
                  const currentOptions = optionsRef.current
                  const highlight = result.tokens.slice(0, 3)
                  const summary =
                    highlight.length === 0
                      ? 'No trending memecoins available right now.'
                      : highlight
                          .map(
                            (token) =>
                              `${token.symbol} ${formatSpokenPrice(token.priceUsd)} (${formatSpokenChange(token.change24hPercentage)})`,
                          )
                          .join('; ')

                  if (
                    showInChat &&
                    currentOptions.mode !== 'onboarding' &&
                    result.tokens.length > 0
                  ) {
                    currentOptions.onTokensQuoted?.(
                      prompt,
                      result.tokens,
                      summary,
                    )
                  }

                  return JSON.stringify({
                    ok: result.tokens.length > 0,
                    isSimulated: result.isSimulated,
                    message: result.message,
                    tokens: result.tokens.map((token) => ({
                      symbol: token.symbol,
                      name: token.name,
                      priceUsd: token.priceUsd,
                      change24hPercentage: token.change24hPercentage,
                    })),
                    speak: summary,
                  })
                } catch (error) {
                  return JSON.stringify({
                    ok: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Unable to fetch trending memecoins',
                  })
                }
              },
            }),
            tool({
              name: 'search_prediction_markets',
              description:
                'Fetch live prediction markets so you can explain YES/NO options conversationally. Keep showInChat false unless they ask to see the list.',
              parameters: predictionMarketsParameters,
              async execute({ query, prompt, showInChat }) {
                try {
                  const reply = await prepareMarketsReply(query)
                  const currentOptions = optionsRef.current
                  const markets =
                    reply.attachment?.kind === 'markets'
                      ? reply.attachment.markets
                      : []

                  if (
                    showInChat &&
                    currentOptions.mode !== 'onboarding' &&
                    markets.length > 0
                  ) {
                    currentOptions.onMarketsQuoted?.(prompt, reply)
                  }

                  return JSON.stringify({
                    ok: markets.length > 0,
                    speak: reply.text,
                    markets: markets.slice(0, 3).map((market) => ({
                      id: market.id,
                      title: market.title,
                      yesProbability: market.yesProbability,
                      noProbability: market.noProbability,
                      exampleYesPayoutFor2:
                        2 / Math.max(market.yesProbability, 0.01),
                      exampleNoPayoutFor2:
                        2 / Math.max(market.noProbability, 0.01),
                    })),
                  })
                } catch (error) {
                  return JSON.stringify({
                    ok: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Unable to search prediction markets',
                  })
                }
              },
            }),
            tool({
              name: 'prepare_financial_intent',
              description:
                'Prepare a swap or prediction trade and return a spoken stake/payout explanation. Keep showInChat false unless they ask for the on-screen receipt.',
              parameters: financialIntentParameters,
              async execute({ prompt, showInChat }) {
                try {
                  const intent = await interpretIntent({ prompt })
                  const currentOptions = optionsRef.current
                  const walletSnapshot =
                    currentOptions.mode === 'onboarding'
                      ? undefined
                      : currentOptions.getWalletSnapshot()
                  const reply = await prepareTradeReply(
                    prompt,
                    intent,
                    walletSnapshot,
                  )

                  if (
                    reply.attachment?.kind === 'prediction' ||
                    reply.attachment?.kind === 'swap'
                  ) {
                    pendingTradeRef.current = reply.attachment.quote
                  }

                  if (showInChat && currentOptions.mode !== 'onboarding') {
                    currentOptions.onTradePrepared?.(prompt, reply)
                  }

                  return JSON.stringify({
                    ok: Boolean(reply.attachment),
                    intent,
                    speak: reply.text,
                    attachmentKind: reply.attachment?.kind ?? null,
                    awaitingConfirm: Boolean(reply.attachment),
                  })
                } catch (error) {
                  return JSON.stringify({
                    ok: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Unable to prepare the trade',
                  })
                }
              },
            }),
            tool({
              name: 'confirm_mock_trade',
              description:
                'Confirm the pending trade request after the user approves. Celebrate out loud without claiming funds moved. Keep showInChat false unless they asked to see chat.',
              parameters: z.object({
                prompt: z
                  .string()
                  .trim()
                  .min(1)
                  .describe('The user’s confirmation words'),
                showInChat: showInChatParameter,
              }),
              async execute({ prompt, showInChat }) {
                const pending = pendingTradeRef.current

                if (!pending) {
                  return JSON.stringify({
                    ok: false,
                    error:
                      'No pending trade to confirm. Prepare a trade first.',
                  })
                }

                const currentOptions = optionsRef.current
                if (currentOptions.mode === 'onboarding') {
                  return JSON.stringify({
                    ok: false,
                    error: 'Trades are unavailable during onboarding.',
                  })
                }

                const tradeResult =
                  currentOptions.applyConfirmedTrade(pending)
                pendingTradeRef.current = null

                if (!tradeResult.isApplied) {
                  return JSON.stringify({
                    ok: false,
                    error: tradeResult.message,
                    speak: tradeResult.message,
                  })
                }

                const celebration = buildTradeCelebration(pending)
                const completedReply: DiloReply = {
                  ...celebration,
                  text: `${celebration.text} Your demo balance is now $${tradeResult.snapshot.totalBalanceUsd.toFixed(2)}.`,
                }

                if (showInChat) {
                  currentOptions.onTradeCompleted?.(prompt, completedReply)
                }

                return JSON.stringify({
                  ok: true,
                  isDemo: true,
                  speak: completedReply.text,
                  kind: pending.kind,
                  remainingBalanceUsd:
                    tradeResult.snapshot.totalBalanceUsd,
                })
              },
            }),
          ]

      const agent = new RealtimeAgent({
        name: 'Dilo',
        instructions: isOnboarding
          ? onboardingAgentInstructions
          : agentInstructions,
        tools,
      })
      const session = new RealtimeSession(agent, {
        model: 'gpt-realtime-2.1',
        transport: 'webrtc',
      })

      session.on('agent_tool_start', () => {
        if (sessionRef.current === session) {
          setStatus('processing')
        }
      })
      session.on('agent_tool_end', () => {
        if (sessionRef.current === session) {
          setStatus('listening')
        }
      })
      session.on('audio_start', () => {
        if (sessionRef.current === session) {
          setStatus('speaking')
        }
      })
      session.on('audio_stopped', () => {
        if (sessionRef.current === session) {
          setStatus('listening')
        }
      })
      session.on('error', ({ error }) => {
        if (sessionRef.current !== session) {
          return
        }

        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'Voice session failed',
        )
      })

      await session.connect({ apiKey: sessionCredentials.clientSecret })

      if (
        !isMountedRef.current ||
        startGeneration !== startGenerationRef.current
      ) {
        session.close()
        isStartingRef.current = false
        return
      }

      sessionRef.current = session
      isStartingRef.current = false
      setStatus('listening')

      if (isOnboarding) {
        session.sendMessage('Please begin the onboarding walkthrough now.')
      } else if (
        optionsRef.current.mode !== 'onboarding' &&
        optionsRef.current.greetOnStart
      ) {
        session.sendMessage(
          'Greet the user in one short line and ask what they want to trade today — mention memecoins or prediction markets as the options. Do not mention Solana, wallets, or chains.',
        )
      }
    } catch (error) {
      if (startGeneration !== startGenerationRef.current) {
        return
      }

      sessionRef.current?.close()
      sessionRef.current = null
      isStartingRef.current = false
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to start voice',
      )
    }
  }, [isSupported])

  return {
    status,
    errorMessage,
    isSupported,
    start,
    stop,
  }
}

function formatSpokenPrice(priceUsd: number): string {
  if (priceUsd >= 1) {
    return `$${priceUsd.toFixed(2)}`
  }

  if (priceUsd >= 0.01) {
    return `$${priceUsd.toFixed(4)}`
  }

  return `$${priceUsd.toPrecision(3)}`
}

function formatSpokenChange(change24hPercentage: number): string {
  const absolute = Math.abs(change24hPercentage).toFixed(1)
  return change24hPercentage >= 0 ? `up ${absolute}%` : `down ${absolute}%`
}
