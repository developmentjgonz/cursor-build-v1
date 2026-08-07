import { ShieldCheck, Wallet, Wand2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { DiloWordmark } from '../../components/brand/dilo-wordmark'
import { DiloAvatar } from '../../components/dilo/dilo-avatar'
import { Button } from '../../components/ui/button'
import { Screen, ScreenBody, ScreenFooter } from '../../components/ui/screen'
import type { RealtimeVoiceStatus } from '../chat/use-realtime-voice'
import { GradientSquiggle } from './components/gradient-squiggle'
import { MiamiSkyline } from './components/miami-skyline'
import { VoiceGuideStatus } from './components/voice-guide-status'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onUseExistingWallet: () => void
  voiceStatus?: RealtimeVoiceStatus
  voiceErrorMessage?: string | null
}

const heroEase = [0.22, 1, 0.36, 1] as const

export function WelcomeScreen({
  onCreateWallet,
  onUseExistingWallet,
  voiceStatus = 'disconnected',
  voiceErrorMessage = null,
}: WelcomeScreenProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Screen>
      <ScreenBody className="flex flex-col overflow-hidden pb-0">
        {/* The one authored moment on this screen: the skyline settles back to
            rest. Everything below it is visible from the first frame. */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: heroEase }}
          className="relative -mx-5 h-[32svh] max-h-[260px] min-h-[180px] shrink-0"
        >
          <MiamiSkyline className="absolute inset-0" />
          <span
            className="absolute inset-x-0 top-0 flex justify-center pt-safe"
            aria-hidden="true"
          >
            <DiloWordmark size="xl" />
          </span>
        </motion.div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 pt-5 pb-4 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
              Welcome
            </h1>
            <GradientSquiggle className="mt-3" />
            <p className="mt-3.5 max-w-[21rem] text-[0.9375rem] leading-relaxed text-muted">
              Explore prediction markets in plain language. Tell us what you
              think will happen — we handle the Solana details and show you
              everything before you approve.
            </p>
          </div>

          <DiloAvatar
            mood="waving"
            size={108}
            hasGlow
            label="Dilo, waving hello"
            className="shrink-0"
          />
        </div>
      </ScreenBody>

      <ScreenFooter>
        <Button variant="brand" size="lg" block onClick={onCreateWallet}>
          <Wand2 className="size-5" aria-hidden="true" />
          <span>Create wallet</span>
        </Button>
        <Button variant="outline" size="lg" block onClick={onUseExistingWallet}>
          <Wallet className="size-5" aria-hidden="true" />
          <span>I already have a wallet</span>
        </Button>
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
            Talk it through with Dilo, or tap a button. You approve every move.
          </span>
        </p>
      </ScreenFooter>
    </Screen>
  )
}
