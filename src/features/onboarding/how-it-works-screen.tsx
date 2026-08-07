import { ArrowLeft, ChevronRight, ShieldCheck } from 'lucide-react'

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
import { BenefitList } from './components/benefit-list'
import { SetupTimeline } from './components/setup-timeline'
import { VoiceGuideStatus } from './components/voice-guide-status'

interface HowItWorksScreenProps {
  onContinue: () => void
  onBack: () => void
  voiceStatus?: RealtimeVoiceStatus
  voiceErrorMessage?: string | null
}

export function HowItWorksScreen({
  onContinue,
  onBack,
  voiceStatus = 'disconnected',
  voiceErrorMessage = null,
}: HowItWorksScreenProps) {
  return (
    <Screen>
      <ScreenTop>
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2.5"
            onClick={onBack}
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
        <div className="flex items-center gap-4">
          <DiloAvatar mood="happy" size={104} hasGlow label="Dilo" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.625rem] leading-[1.15] font-extrabold tracking-[-0.03em] text-ink">
              Your wallet is ready
              <span className="text-brand block">Next, add funds</span>
            </h1>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
              Dilo makes Solana simple and secure for everyone.
            </p>
          </div>
        </div>

        <SetupTimeline className="mt-8" />
        <BenefitList className="mt-7" />
      </ScreenBody>

      <ScreenFooter>
        <Button
          variant="brand"
          size="lg"
          block
          className="relative"
          onClick={onContinue}
        >
          <span>Add funds</span>
          <ChevronRight className="absolute right-5 size-5" aria-hidden="true" />
        </Button>

        <VoiceGuideStatus
          status={voiceStatus}
          errorMessage={voiceErrorMessage}
        />

        <p className="sr-only">Step 2 of 3</p>
        <span aria-hidden="true" className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-midnight-500" />
          <span className="size-2 rounded-full bg-brand" />
          <span className="size-1.5 rounded-full bg-midnight-500" />
        </span>
      </ScreenFooter>
    </Screen>
  )
}
