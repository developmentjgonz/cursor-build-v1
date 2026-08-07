import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { createRealtimeSession } from '../../lib/voice/realtime-service'
import { diloPersona } from '../chat/dilo-persona'
import type { DepositMethodId } from '../funding/deposit-model'
import type {
  RealtimeVoice,
  RealtimeVoiceStatus,
} from '../chat/use-realtime-voice'

export type OnboardingPhase =
  | 'welcome'
  | 'create-wallet'
  | 'how-it-works'
  | 'funding'
  | 'connect-wallet'

export type FundingVoiceStep =
  | 'amount'
  | 'method'
  | 'card'
  | 'review'
  | 'success'
  | 'processing'

export interface OnboardingVoiceHandlers {
  onCreateWallet: () => void
  onUseExistingWallet: () => void
  onContinueHowItWorks: () => void
  onConnectPhantom: () => void
  onContinueAfterConnect: () => void
  onSetDepositAmount: (amountUsd: number) => string
  onSetDepositMethod: (methodId: DepositMethodId) => string
  onContinueFunding: () => string
  onConfirmDeposit: () => string
  onFinishFunding: () => string
}

interface UseOnboardingVoiceOptions extends OnboardingVoiceHandlers {
  phase: OnboardingPhase
  fundingStep: FundingVoiceStep | null
  /** True once Phantom has connected on the connect-wallet screen. */
  isWalletConnected: boolean
  isEnabled: boolean
}

interface GuidedSession {
  close: () => void
  sendMessage: (message: string) => void
}

/**
 * Survives React Strict Mode remounts. Only one onboarding voice session may
 * exist in the tab — remounts reuse it instead of spawning a second Dilo.
 */
interface GlobalOnboardingVoice {
  session: GuidedSession | null
  status: RealtimeVoiceStatus
  errorMessage: string | null
  startToken: number
  hasGreeted: boolean
  lastScene: string
  isStarting: boolean
  options: UseOnboardingVoiceOptions | null
  listeners: Set<() => void>
}

// Pinned to globalThis, not module scope: a Vite HMR update re-evaluates this
// module, and a fresh module-scoped singleton would lose the handle to a
// session that is still connected and speaking.
const voiceRegistryKey = '__diloOnboardingVoice__'

const globalVoice: GlobalOnboardingVoice = ((
  globalThis as Record<string, unknown>
)[voiceRegistryKey] ??= {
  session: null,
  status: 'disconnected',
  errorMessage: null,
  startToken: 0,
  hasGreeted: false,
  lastScene: '',
  isStarting: false,
  options: null,
  listeners: new Set(),
}) as GlobalOnboardingVoice

const onboardingAgentInstructions = `${diloPersona}

# Your job right now

You are walking a brand-new user through the live setup screens. System updates tell you which screen they are on — never invent a screen. Your goal is to get them trading, so keep setup light and quick.

Rules that override everything:
- Do not speak until you get the first system walkthrough message.
- Introduce yourself once for the whole setup. Never restart your intro, never talk over yourself.

Welcome screen:
- One line of hello, then ask if you should make them a wallet or if they already have one.
- Call create_wallet or use_existing_wallet.

While the wallet is being created, and on the how-it-works screen:
- Keep it light — this takes seconds.
- Sum up how it works in one breath, then ask if they're ready to add funds. Call continue_how_it_works when they say yes.

Connect screen, for users with their own wallet:
- When they are ready, call connect_phantom and ask them to approve in Phantom.
- After they are connected, wait for them to say they're ready, then call continue_after_connect. Do not rush them in.

Adding funds:
- Help them land on an amount with set_deposit_amount, and card or bank with set_deposit_method, then call continue_funding.
- On the card screen, tell them to type their card in on the phone. NEVER ask them to say a card number, expiry, or CVC out loud. When they say they're done, call continue_funding.
- On review, say the amount out loud once, then call confirm_deposit after they approve.
- On the success screen, call finish_funding when they're ready to go.`

function supportsRealtimeVoice(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof RTCPeerConnection !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  )
}

function describeScene(
  phase: OnboardingPhase,
  fundingStep: FundingVoiceStep | null,
  isWalletConnected: boolean,
): string {
  if (phase === 'funding' && fundingStep) {
    if (fundingStep === 'card') {
      return 'The user is on the card entry screen. Tell them to type their card on the phone now. Do not collect digits by voice. When they say they finished, call continue_funding.'
    }

    return `The user is on the funding flow, step “${fundingStep}”. Guide the next action with the funding tools.`
  }

  if (phase === 'connect-wallet') {
    if (isWalletConnected) {
      return 'Phantom is connected. Celebrate briefly, then call continue_after_connect when they say they are ready to open Dilo.'
    }

    return 'The user is on Connect Phantom. Call connect_phantom when they are ready to approve.'
  }

  const scenes: Record<
    Exclude<OnboardingPhase, 'connect-wallet'>,
    string
  > = {
    welcome:
      'The user is on the welcome screen with Create wallet and I already have a wallet.',
    'create-wallet':
      'The app is creating their wallet on screen. Reassure them briefly.',
    'how-it-works':
      'The user is on How it works. Summarize quickly and call continue_how_it_works when they want to add funds.',
    funding: 'The user is in the funding flow.',
  }

  return scenes[phase]
}

function publishGlobalVoice(
  patch: Partial<
    Pick<GlobalOnboardingVoice, 'status' | 'errorMessage' | 'session' | 'hasGreeted' | 'lastScene' | 'isStarting'>
  >,
): void {
  Object.assign(globalVoice, patch)
  for (const listener of globalVoice.listeners) {
    listener()
  }
}

function stopGlobalSession(): void {
  globalVoice.startToken += 1
  globalVoice.session?.close()
  publishGlobalVoice({
    session: null,
    status: 'disconnected',
    errorMessage: null,
    hasGreeted: false,
    lastScene: '',
    isStarting: false,
  })
}

function getOptions(): UseOnboardingVoiceOptions {
  const options = globalVoice.options

  if (!options) {
    throw new Error('Onboarding voice options are not ready.')
  }

  return options
}

async function startGlobalSession(): Promise<void> {
  if (!supportsRealtimeVoice()) {
    publishGlobalVoice({
      status: 'error',
      errorMessage: 'Voice is not supported in this browser.',
    })
    return
  }

  if (globalVoice.session || globalVoice.isStarting) {
    return
  }

  const startToken = globalVoice.startToken + 1
  globalVoice.startToken = startToken
  publishGlobalVoice({
    isStarting: true,
    status: 'connecting',
    errorMessage: null,
  })

  try {
    const [{ RealtimeAgent, RealtimeSession, tool }, sessionCredentials] =
      await Promise.all([
        import('@openai/agents/realtime'),
        createRealtimeSession(crypto.randomUUID()),
      ])

    if (startToken !== globalVoice.startToken) {
      publishGlobalVoice({ isStarting: false })
      return
    }

    const tools = [
      tool({
        name: 'create_wallet',
        description: 'Start creating a new Dilo wallet from the welcome screen.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'welcome') {
            return 'Not on welcome. Wait for the welcome screen.'
          }

          window.setTimeout(getOptions().onCreateWallet, 0)
          return 'Creating the wallet on screen now.'
        },
      }),
      tool({
        name: 'use_existing_wallet',
        description:
          'Take the user to connect an existing Phantom wallet from welcome.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'welcome') {
            return 'Not on welcome. Wait for the welcome screen.'
          }

          window.setTimeout(getOptions().onUseExistingWallet, 0)
          return 'Opening Phantom connect.'
        },
      }),
      tool({
        name: 'continue_how_it_works',
        description: 'Continue from How it works into funding.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'how-it-works') {
            return 'Not on How it works yet.'
          }

          window.setTimeout(getOptions().onContinueHowItWorks, 0)
          return 'Moving to add funds.'
        },
      }),
      tool({
        name: 'connect_phantom',
        description: 'Start the Phantom connection request on the connect screen.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'connect-wallet') {
            return 'Not on the Phantom connect screen.'
          }

          if (getOptions().isWalletConnected) {
            return 'Already connected. Call continue_after_connect when they are ready.'
          }

          window.setTimeout(getOptions().onConnectPhantom, 0)
          return 'Phantom connection requested. Ask them to approve in the wallet.'
        },
      }),
      tool({
        name: 'continue_after_connect',
        description:
          'Leave the connected Phantom screen and open Dilo after the user is ready.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'connect-wallet') {
            return 'Not on the Phantom connect screen.'
          }

          if (!getOptions().isWalletConnected) {
            return 'Wallet is not connected yet. Call connect_phantom first.'
          }

          window.setTimeout(getOptions().onContinueAfterConnect, 0)
          return 'Opening Dilo now.'
        },
      }),
      tool({
        name: 'set_deposit_amount',
        description: 'Set how much USD the user wants to deposit.',
        parameters: z.object({
          amountUsd: z.number().positive().max(10_000),
        }),
        async execute({ amountUsd }) {
          if (getOptions().phase !== 'funding') {
            return 'Not in funding yet.'
          }

          return getOptions().onSetDepositAmount(amountUsd)
        },
      }),
      tool({
        name: 'set_deposit_method',
        description: 'Choose card or bank (ACH) for the deposit.',
        parameters: z.object({
          methodId: z.enum(['card', 'ach']),
        }),
        async execute({ methodId }) {
          if (getOptions().phase !== 'funding') {
            return 'Not in funding yet.'
          }

          return getOptions().onSetDepositMethod(methodId)
        },
      }),
      tool({
        name: 'continue_funding',
        description:
          'Advance the funding flow to the next step (amount → method → card → review).',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'funding') {
            return 'Not in funding yet.'
          }

          return getOptions().onContinueFunding()
        },
      }),
      tool({
        name: 'confirm_deposit',
        description: 'Confirm the deposit on the review step.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'funding') {
            return 'Not in funding yet.'
          }

          return getOptions().onConfirmDeposit()
        },
      }),
      tool({
        name: 'finish_funding',
        description: 'Leave the funding success screen and enter the app.',
        parameters: z.object({}),
        async execute() {
          if (getOptions().phase !== 'funding') {
            return 'Not in funding yet.'
          }

          return getOptions().onFinishFunding()
        },
      }),
    ]

    const agent = new RealtimeAgent({
      name: 'Dilo',
      instructions: onboardingAgentInstructions,
      tools,
    })
    const session = new RealtimeSession(agent, {
      model: 'gpt-realtime-2.1',
      transport: 'webrtc',
    })

    const guidedSession: GuidedSession = {
      close: () => session.close(),
      sendMessage: (message: string) => {
        session.sendMessage(message)
      },
    }

    session.on('agent_tool_start', () => {
      if (globalVoice.session === guidedSession) {
        publishGlobalVoice({ status: 'processing' })
      }
    })
    session.on('agent_tool_end', () => {
      if (globalVoice.session === guidedSession) {
        publishGlobalVoice({ status: 'listening' })
      }
    })
    session.on('audio_start', () => {
      if (globalVoice.session === guidedSession) {
        publishGlobalVoice({ status: 'speaking' })
      }
    })
    session.on('audio_stopped', () => {
      if (globalVoice.session === guidedSession) {
        publishGlobalVoice({ status: 'listening' })
      }
    })
    session.on('error', ({ error }) => {
      if (globalVoice.session !== guidedSession) {
        return
      }

      publishGlobalVoice({
        status: 'error',
        errorMessage:
          error instanceof Error ? error.message : 'Voice session failed',
      })
    })

    await session.connect({ apiKey: sessionCredentials.clientSecret })

    if (startToken !== globalVoice.startToken) {
      session.close()
      publishGlobalVoice({ isStarting: false })
      return
    }

    const options = getOptions()
    const opening = describeScene(
      options.phase,
      options.fundingStep,
      options.isWalletConnected,
    )

    publishGlobalVoice({
      session: guidedSession,
      status: 'listening',
      isStarting: false,
      lastScene: opening,
    })

    if (!globalVoice.hasGreeted) {
      globalVoice.hasGreeted = true
      guidedSession.sendMessage(
        `Begin the onboarding walkthrough now. ${opening} Speak one short greeting, then ask create-wallet vs already-have-one. Do not repeat the greeting.`,
      )
    }
  } catch (error) {
    if (startToken !== globalVoice.startToken) {
      return
    }

    publishGlobalVoice({
      session: null,
      status: 'error',
      isStarting: false,
      errorMessage:
        error instanceof Error ? error.message : 'Unable to start voice',
    })
  }
}

function notifyScene(
  phase: OnboardingPhase,
  fundingStep: FundingVoiceStep | null,
  isWalletConnected: boolean,
): void {
  if (!globalVoice.session || globalVoice.status === 'connecting') {
    return
  }

  const scene = describeScene(phase, fundingStep, isWalletConnected)

  if (scene === globalVoice.lastScene) {
    return
  }

  globalVoice.lastScene = scene
  globalVoice.session.sendMessage(`System update: ${scene}`)
}

export function useOnboardingVoice(
  options: UseOnboardingVoiceOptions,
): RealtimeVoice {
  const [, setTick] = useState(0)
  const isSupported = supportsRealtimeVoice()
  const optionsRef = useRef(options)
  optionsRef.current = options
  globalVoice.options = options

  useEffect(() => {
    const listener = () => setTick((value) => value + 1)
    globalVoice.listeners.add(listener)

    return () => {
      globalVoice.listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!options.isEnabled) {
      stopGlobalSession()
      return
    }

    void startGlobalSession()
  }, [options.isEnabled])

  useEffect(() => {
    if (!options.isEnabled) {
      return
    }

    notifyScene(options.phase, options.fundingStep, options.isWalletConnected)
  }, [
    options.fundingStep,
    options.isEnabled,
    options.isWalletConnected,
    options.phase,
  ])

  const start = useCallback(async () => {
    globalVoice.options = optionsRef.current
    await startGlobalSession()
  }, [])

  const stop = useCallback(() => {
    stopGlobalSession()
  }, [])

  return {
    status: globalVoice.status,
    errorMessage: globalVoice.errorMessage,
    isSupported,
    start,
    stop,
  }
}
