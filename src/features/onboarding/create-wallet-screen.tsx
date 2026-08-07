import { ArrowLeft, Check, LoaderCircle, ShieldCheck } from 'lucide-react'
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
import { VoiceGuideStatus } from './components/voice-guide-status'

interface CreateWalletScreenProps {
  wallet: MockWallet
  onCreated: () => void
  onBack: () => void
  voiceStatus?: RealtimeVoiceStatus
  voiceErrorMessage?: string | null
}

const successHoldMs = 1100
const easeOut = [0.22, 1, 0.36, 1] as const

export function CreateWalletScreen({
  wallet,
  onCreated,
  onBack,
  voiceStatus = 'disconnected',
  voiceErrorMessage = null,
}: CreateWalletScreenProps) {
  const shouldReduceMotion = useReducedMotion()
  const hasStartedRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const isCreating = wallet.status === 'creating'
  const isCreated = wallet.status === 'connected' && wallet.address !== null

  useEffect(() => {
    if (hasStartedRef.current || wallet.status !== 'disconnected') {
      return
    }

    hasStartedRef.current = true
    wallet.createWallet()
  }, [wallet])

  useEffect(() => {
    if (!isCreated || hasCompletedRef.current) {
      return
    }

    hasCompletedRef.current = true
    const timeoutId = window.setTimeout(onCreated, successHoldMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isCreated, onCreated])

  function handleBack() {
    if (isCreating || isCreated) {
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
            disabled={isCreated}
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
          {isCreated && shortAddress ? (
            <motion.div
              key="created"
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 10, filter: 'blur(4px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center"
            >
              <span className="relative">
                <DiloAvatar
                  mood="happy"
                  size={132}
                  hasGlow
                  label="Dilo, celebrating your new wallet"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full border-2 border-midnight-900 bg-mint text-on-brand"
                >
                  <Check className="size-5" strokeWidth={2.8} />
                </span>
              </span>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-ink">
                  Wallet ready
                </h1>
                <p className="font-mono text-[0.9375rem] tabular-nums text-muted">
                  {shortAddress}
                </p>
              </div>

              <p role="status" className="text-[0.8125rem] text-faint">
                Continuing setup…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="creating"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center"
            >
              <DiloAvatar
                mood="curious"
                size={128}
                hasGlow
                label="Dilo, creating your wallet"
              />

              <div className="flex flex-col gap-2">
                <h1 className="text-[1.625rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                  Creating your wallet
                </h1>
                <p className="mx-auto max-w-[20rem] text-[0.9375rem] leading-relaxed text-muted">
                  Setting up a self-custody Solana wallet. Keys stay on your
                  device — Dilo never holds them.
                </p>
              </div>

              <CreationSteps />

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
                Generating secure keys…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScreenBody>

      <ScreenFooter>
        <VoiceGuideStatus
          status={voiceStatus}
          errorMessage={voiceErrorMessage}
        />
        <p className="flex max-w-[20rem] items-center gap-1.5 text-[0.8125rem] leading-snug text-faint">
          <ShieldCheck
            className="size-4 shrink-0 text-mint"
            aria-hidden="true"
          />
          <span className="min-w-0 text-pretty">
            {isCreated
              ? 'Your wallet is ready. You approve every move.'
              : 'This takes a couple of seconds.'}
          </span>
        </p>
      </ScreenFooter>
    </Screen>
  )
}

function CreationSteps() {
  const steps = [
    { id: 'keys', label: 'Generate keys', done: true },
    { id: 'secure', label: 'Secure locally', done: false },
    { id: 'ready', label: 'Ready to fund', done: false },
  ] as const

  return (
    <ol className="w-full max-w-[18rem] space-y-2.5 text-left" aria-hidden="true">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex items-center gap-3 rounded-md border border-midnight-600 bg-midnight-850 px-3.5 py-2.5"
        >
          <span
            className={
              step.done
                ? 'grid size-6 place-items-center rounded-full bg-mint text-on-brand'
                : index === 1
                  ? 'grid size-6 place-items-center rounded-full border border-aqua/50 bg-aqua/10 text-[0.6875rem] font-bold text-aqua'
                  : 'grid size-6 place-items-center rounded-full border border-midnight-500 text-[0.6875rem] font-bold text-faint'
            }
          >
            {step.done ? (
              <Check className="size-3.5" strokeWidth={2.8} />
            ) : (
              index + 1
            )}
          </span>
          <span
            className={
              step.done
                ? 'text-[0.875rem] font-bold text-ink'
                : index === 1
                  ? 'text-[0.875rem] font-bold text-ink'
                  : 'text-[0.875rem] text-faint'
            }
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
