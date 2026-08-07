import { motion, useReducedMotion } from 'motion/react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { formatUsd } from '../../../lib/format'

interface ProcessingStepProps {
  amountUsd: number
  methodLabel: string
}

export function ProcessingStep({ amountUsd, methodLabel }: ProcessingStepProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex min-h-full flex-col">
      <div className="m-auto flex w-full flex-col items-center gap-6 py-10 text-center">
        <DiloAvatar mood="thinking" size={116} hasGlow label="Dilo is working" />

        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
            Adding {formatUsd(amountUsd)}
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Confirming your {methodLabel} deposit. This takes a few seconds.
          </p>
        </div>

        <div
          className="h-1.5 w-40 overflow-hidden rounded-full bg-midnight-700"
          role="progressbar"
          aria-label="Deposit progress"
        >
          <motion.div
            className="h-full w-full origin-left rounded-full bg-brand"
            initial={{ scaleX: shouldReduceMotion ? 1 : 0.08 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.5, ease: 'easeOut' }}
          />
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Adding {formatUsd(amountUsd)} with your {methodLabel} deposit. Please
          wait.
        </p>
      </div>
    </div>
  )
}
