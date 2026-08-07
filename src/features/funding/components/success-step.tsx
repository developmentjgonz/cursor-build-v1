import { Check } from 'lucide-react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { Panel } from '../../../components/ui/panel'
import { formatUsd } from '../../../lib/format'

interface SuccessStepProps {
  amountUsd: number
  methodLabel: string
}

export function SuccessStep({ amountUsd, methodLabel }: SuccessStepProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="m-auto flex w-full flex-col items-center gap-5 py-8 text-center">
        <DiloAvatar mood="happy" size={124} hasGlow label="Dilo is pleased" />

        <div className="flex flex-col items-center gap-2">
          <Panel
            tone="quiet"
            padding="none"
            className="inline-flex items-center gap-1.5 rounded-full border-mint/50 px-3 py-1.5"
          >
            <Check className="size-4 text-mint" strokeWidth={3} aria-hidden="true" />
            <span className="text-[0.8125rem] font-bold text-ink">Added</span>
          </Panel>

          <p className="text-5xl font-extrabold tracking-[-0.04em] text-ink tabular-nums">
            {formatUsd(amountUsd)}
          </p>

          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Your {methodLabel} deposit is in your Dilo wallet and ready to use.
          </p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Deposit complete. {formatUsd(amountUsd)} added with {methodLabel}.
        </p>
      </div>
    </div>
  )
}
