import { ArrowLeft, ChevronRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { DiloWordmark } from '../../components/brand/dilo-wordmark'
import { DiloAvatar } from '../../components/dilo/dilo-avatar'
import { Button } from '../../components/ui/button'
import {
  Screen,
  ScreenBody,
  ScreenFooter,
  ScreenTop,
} from '../../components/ui/screen'
import type { RealtimeVoiceStatus } from '../chat/use-realtime-voice'
import type { MockWallet } from '../wallet/use-mock-wallet'
import { PhantomMark } from './components/phantom-mark'
import { VoiceGuideStatus } from './components/voice-guide-status'

interface ConnectWalletScreenProps {
  wallet: MockWallet
  onContinue: () => void
  onBack: () => void
  /** Increment to trigger connect from the voice walkthrough. */
  connectRequestId?: number
  /** Increment to continue into the app from the voice walkthrough. */
  continueRequestId?: number
  voiceStatus?: RealtimeVoiceStatus
  voiceErrorMessage?: string | null
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function ConnectWalletScreen({
  wallet,
  onContinue,
  onBack,
  connectRequestId = 0,
  continueRequestId = 0,
  voiceStatus = 'disconnected',
  voiceErrorMessage = null,
}: ConnectWalletScreenProps) {
  const shouldReduceMotion = useReducedMotion()
  const lastConnectRequestRef = useRef(0)
  const lastContinueRequestRef = useRef(0)
  const isConnecting = wallet.status === 'connecting'
  const isConnected = wallet.status === 'connected' && wallet.address !== null

  useEffect(() => {
    if (
      connectRequestId === 0 ||
      connectRequestId === lastConnectRequestRef.current
    ) {
      return
    }

    lastConnectRequestRef.current = connectRequestId

    if (wallet.status === 'disconnected') {
      wallet.connect()
    }
  }, [connectRequestId, wallet])

  useEffect(() => {
    if (
      continueRequestId === 0 ||
      continueRequestId === lastContinueRequestRef.current
    ) {
      return
    }

    lastContinueRequestRef.current = continueRequestId

    if (isConnected) {
      onContinue()
    }
  }, [continueRequestId, isConnected, onContinue])

  function handleConnect() {
    if (wallet.status !== 'disconnected') {
      return
    }

    wallet.connect()
  }

  function handleBack() {
    if (isConnecting) {
      wallet.disconnect()
    }

    onBack()
  }

  const shortAddress = wallet.address
    ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
    : null

  return (
    <Screen>
      <ScreenTop>
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2.5"
            onClick={handleBack}
            disabled={isConnected}
            aria-label="Back to welcome"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
          <DiloWordmark size="md" />
        </div>

        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-aqua/40 bg-aqua/10 text-aqua"
        >
          <ShieldCheck className="size-5" />
        </span>
      </ScreenTop>

      <ScreenBody className="flex flex-col pt-2">
        <AnimatePresence mode="wait" initial={false}>
          {isConnected && shortAddress ? (
            <motion.div
              key="connected"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center"
            >
              <DiloAvatar
                mood="happy"
                size={132}
                hasGlow
                label="Dilo, happy you’re connected"
              />
              <div className="flex flex-col gap-1.5">
                <p className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-ink">
                  Connected
                </p>
                <p className="font-mono text-[0.9375rem] tabular-nums text-muted">
                  {shortAddress}
                </p>
              </div>
              <p className="max-w-[20rem] text-[0.9375rem] leading-relaxed text-muted">
                You’re in. Continue when you’re ready to open Dilo.
              </p>
            </motion.div>
          ) : isConnecting ? (
            <motion.div
              key="connecting"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="flex flex-1 flex-col gap-5 pt-2"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <DiloAvatar
                  mood="curious"
                  size={112}
                  hasGlow
                  label="Dilo, waiting with you"
                />
                <div className="flex flex-col gap-2">
                  <h1 className="text-[1.5rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                    Waiting on Phantom
                  </h1>
                  <p className="max-w-[20rem] text-[0.9375rem] leading-relaxed text-muted">
                    Approve the connection in your wallet. Dilo never holds your
                    keys.
                  </p>
                </div>
              </div>
              <ApprovalPanel />
              <p
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 text-[0.8125rem] text-muted"
              >
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
                Waiting for approval in Phantom…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-col items-center gap-5 pt-2 text-center">
                <DiloAvatar
                  mood="waving"
                  size={140}
                  hasGlow
                  label="Dilo, ready to connect"
                />
                <div className="flex flex-col gap-2">
                  <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                    Connect your wallet
                  </h1>
                  <p className="max-w-[21rem] text-[0.9375rem] leading-relaxed text-muted">
                    Approve the connection in Phantom. Dilo can see your address
                    and ask you to sign — it never holds your keys.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnect}
                className="mt-8 flex w-full items-center gap-3.5 rounded-lg border border-midnight-500 bg-midnight-850 px-4 py-4 text-left transition-colors hover:border-aqua focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
              >
                <PhantomMark size={44} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="text-[1rem] font-extrabold tracking-[-0.02em] text-ink">
                    Phantom
                  </strong>
                  <span className="text-[0.8125rem] text-muted">
                    Recommended for Solana
                  </span>
                </span>
                <span className="text-[0.8125rem] font-bold text-violet-neon">
                  Connect
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ScreenBody>

      <ScreenFooter>
        {isConnected ? (
          <>
            <Button
              variant="brand"
              size="lg"
              block
              className="relative"
              onClick={onContinue}
            >
              <span>Open Dilo</span>
              <ChevronRight
                aria-hidden="true"
                className="absolute right-4 size-5 opacity-80"
              />
            </Button>
            <p className="flex max-w-[20rem] items-center gap-1.5 text-[0.8125rem] leading-snug text-faint">
              <ShieldCheck
                className="size-4 shrink-0 text-mint"
                aria-hidden="true"
              />
              <span className="min-w-0 text-pretty">
                You stay in control of every signature.
              </span>
            </p>
          </>
        ) : isConnecting ? (
          <Button variant="outline" size="lg" block onClick={handleBack}>
            Cancel
          </Button>
        ) : (
          <>
            <Button variant="brand" size="lg" block onClick={handleConnect}>
              <PhantomMark size={22} />
              <span>Connect Phantom</span>
            </Button>
            <p className="flex max-w-[20rem] items-center gap-1.5 text-[0.8125rem] leading-snug text-faint">
              <ShieldCheck
                className="size-4 shrink-0 text-mint"
                aria-hidden="true"
              />
              <span className="min-w-0 text-pretty">
                Same steps as a real Phantom connect — approve, then you’re in.
              </span>
            </p>
          </>
        )}
        <VoiceGuideStatus
          status={voiceStatus}
          errorMessage={voiceErrorMessage}
        />
      </ScreenFooter>
    </Screen>
  )
}

function ApprovalPanel() {
  return (
    <div
      className="rounded-lg border border-midnight-500 bg-midnight-850 p-5"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <PhantomMark size={40} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[0.9375rem] font-extrabold text-ink">Phantom</p>
          <p className="text-[0.75rem] text-faint">Connection request</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-midnight-600 bg-midnight-900 px-3.5 py-3">
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          <span className="font-bold text-ink">Dilo</span> wants to connect to
          your wallet. This lets the app see your address and request
          signatures.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <span className="grid min-h-11 place-items-center rounded-md border border-midnight-600 text-[0.875rem] font-bold text-muted">
          Cancel
        </span>
        <span className="grid min-h-11 place-items-center rounded-md bg-[#AB9FF2] text-[0.875rem] font-bold text-[#2A2145]">
          Connect
        </span>
      </div>
    </div>
  )
}
