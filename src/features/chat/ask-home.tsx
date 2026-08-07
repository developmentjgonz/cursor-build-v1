import {
  LoaderCircle,
  MessageCircle,
  MessagesSquare,
  Mic,
  Square,
  TriangleAlert,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import type { TrendingToken } from '../../../shared/contracts/token'
import { DiloAvatar, type DiloMood } from '../../components/dilo/dilo-avatar'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/cn'
import type {
  MockTradeQuote,
  MockTradeResult,
  MockWalletSnapshot,
} from '../wallet/use-mock-wallet'
import type { DiloReply } from './chat-types'
import {
  useRealtimeVoice,
  type RealtimeVoiceStatus,
} from './use-realtime-voice'

interface AskHomeProps {
  hasConversation: boolean
  onOpenChat: () => void
  onVoiceReply: (prompt: string, reply: DiloReply) => void
  onVoiceTokens: (
    prompt: string,
    tokens: readonly TrendingToken[],
    summary: string,
  ) => void
  getWalletSnapshot: () => MockWalletSnapshot
  applyConfirmedTrade: (quote: MockTradeQuote) => MockTradeResult
}

const easeOut = [0.22, 1, 0.36, 1] as const

const statusCopy: Partial<
  Record<RealtimeVoiceStatus, { title: string; body: string }>
> = {
  connecting: {
    title: 'Connecting…',
    body: 'Getting Dilo on the line.',
  },
  listening: {
    title: 'Listening',
    body: 'Name a coin or a call. Dilo is all ears.',
  },
  processing: {
    title: 'Got it',
    body: 'Working out the details…',
  },
  speaking: {
    title: 'Dilo is speaking',
    body: 'Hang tight — then jump in anytime.',
  },
}

const moodByStatus: Partial<Record<RealtimeVoiceStatus, DiloMood>> = {
  connecting: 'curious',
  listening: 'idle',
  processing: 'thinking',
  speaking: 'happy',
  error: 'curious',
}

export function AskHome({
  hasConversation,
  onOpenChat,
  onVoiceReply,
  onVoiceTokens,
  getWalletSnapshot,
  applyConfirmedTrade,
}: AskHomeProps) {
  const shouldReduceMotion = useReducedMotion()
  const voice = useRealtimeVoice({
    greetOnStart: true,
    onTradePrepared: onVoiceReply,
    onMarketsQuoted: onVoiceReply,
    onTokensQuoted: onVoiceTokens,
    onTradeCompleted: onVoiceReply,
    getWalletSnapshot,
    applyConfirmedTrade,
  })

  const isVoiceActive =
    voice.status !== 'disconnected' && voice.status !== 'error'
  const hasVoiceError = voice.status === 'error'
  const copy = statusCopy[voice.status]
  const mood = moodByStatus[voice.status] ?? 'waving'

  function handleBeginVoice() {
    if (!voice.isSupported) {
      onOpenChat()
      return
    }

    void voice.start()
  }

  function handleStopVoice() {
    voice.stop()
  }

  function handleOpenChat() {
    // Keep the shared financial voice session alive across Ask home ↔ chat.
    onOpenChat()
  }

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5">
      <div className="flex flex-1 flex-col items-center justify-center-safe gap-7 py-6 text-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="relative"
        >
          <DiloAvatar
            mood={isVoiceActive || hasVoiceError ? mood : 'waving'}
            size={148}
            hasGlow
            label={
              isVoiceActive
                ? `Dilo, ${voice.status}`
                : 'Dilo, ready to talk'
            }
          />

          {isVoiceActive ? <VoiceHalo status={voice.status} /> : null}
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: shouldReduceMotion ? 0 : 0.08,
            ease: easeOut,
          }}
          className="flex max-w-[20rem] flex-col gap-2.5"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isVoiceActive ? voice.status : hasVoiceError ? 'error' : 'idle'}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: easeOut }}
              className="flex flex-col gap-2.5"
            >
              <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
                {hasVoiceError
                  ? 'Voice hit a snag'
                  : isVoiceActive && copy
                    ? copy.title
                    : 'What do you want to trade today?'}
              </h1>
              <p className="text-[0.9375rem] leading-relaxed text-muted">
                {hasVoiceError
                  ? (voice.errorMessage ??
                    'Microphone or connection failed. Try again, or use chat.')
                  : isVoiceActive && copy
                    ? copy.body
                    : 'Memecoins or prediction markets — tell Dilo in plain words. You’ll see every number before you sign.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: shouldReduceMotion ? 0 : 0.14,
            ease: easeOut,
          }}
          className="flex w-full max-w-[20rem] flex-col gap-3"
        >
          {isVoiceActive ? (
            <>
              <Button variant="brand" size="lg" block onClick={handleStopVoice}>
                {voice.status === 'connecting' ? (
                  <>
                    <LoaderCircle
                      className="size-5 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <>
                    <Square className="size-4 fill-current" aria-hidden="true" />
                    <span>End conversation</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                block
                onClick={handleOpenChat}
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                <span>Switch to chat</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="brand" size="lg" block onClick={handleBeginVoice}>
                {hasVoiceError ? (
                  <>
                    <TriangleAlert className="size-5" aria-hidden="true" />
                    <span>Try voice again</span>
                  </>
                ) : !voice.isSupported ? (
                  <>
                    <MessageCircle className="size-5" aria-hidden="true" />
                    <span>Open chat</span>
                  </>
                ) : (
                  <>
                    <Mic className="size-5" aria-hidden="true" />
                    <span>Tap to begin a conversation</span>
                  </>
                )}
              </Button>

              {voice.isSupported ? (
                <Button
                  variant="outline"
                  size="lg"
                  block
                  onClick={handleOpenChat}
                >
                  {hasConversation ? (
                    <>
                      <MessagesSquare className="size-5" aria-hidden="true" />
                      <span>View chat</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-5" aria-hidden="true" />
                      <span>Type in chat instead</span>
                    </>
                  )}
                </Button>
              ) : hasConversation ? (
                <Button
                  variant="outline"
                  size="lg"
                  block
                  onClick={handleOpenChat}
                >
                  <MessagesSquare className="size-5" aria-hidden="true" />
                  <span>View chat</span>
                </Button>
              ) : null}
            </>
          )}

          <p
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            {isVoiceActive
              ? copy?.title ?? voice.status
              : hasVoiceError
                ? (voice.errorMessage ?? 'Voice error')
                : ''}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function VoiceHalo({ status }: { status: RealtimeVoiceStatus }) {
  const shouldReduceMotion = useReducedMotion()
  const isSpeaking = status === 'speaking'
  const isRippling = status === 'listening' || status === 'speaking'
  const ringTone = isSpeaking ? 'border-mint/40' : 'border-aqua/35'
  const glowTone = isSpeaking
    ? 'bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-mint)_22%,transparent),transparent_68%)]'
    : 'bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-aqua)_22%,transparent),transparent_68%)]'

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <span className={cn('absolute -inset-5 rounded-full', glowTone)} />

      <span
        className={cn(
          'absolute -inset-2.5 rounded-full border',
          ringTone,
          !shouldReduceMotion && 'animate-voice-breathe',
        )}
      />

      {isRippling && !shouldReduceMotion ? (
        <>
          <span
            className={cn(
              'absolute -inset-3.5 rounded-full border',
              ringTone,
              'animate-voice-ring',
            )}
          />
          <span
            className={cn(
              'absolute -inset-3.5 rounded-full border',
              ringTone,
              'animate-voice-ring [animation-delay:1.3s]',
            )}
          />
        </>
      ) : (
        <span
          className={cn('absolute -inset-3.5 rounded-full border', ringTone)}
        />
      )}
    </span>
  )
}
