import * as RadioGroup from '@radix-ui/react-radio-group'
import { motion, useReducedMotion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import { useId } from 'react'

import { InfoCard, panelVariants } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { depositMethods, type DepositMethodId } from '../deposit-model'

interface MethodStepProps {
  methodId: DepositMethodId
  onSelectMethod: (methodId: DepositMethodId) => void
}

const pillSpring = { type: 'spring' as const, stiffness: 320, damping: 34 }

export function MethodStep({ methodId, onSelectMethod }: MethodStepProps) {
  const shouldReduceMotion = useReducedMotion()
  const groupLabelId = useId()

  return (
    <div className="flex flex-col gap-6 pt-2 pb-2">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
          Deposit USD
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Add funds to your Dilo account and start using Solana.
        </p>
        <p className="flex items-center gap-2 text-[0.8125rem] text-faint">
          <ShieldCheck className="size-4 shrink-0 text-mint" strokeWidth={2.2} aria-hidden="true" />
          Your money is secure with bank-level encryption.
        </p>
      </div>

      <RadioGroup.Root
        value={methodId}
        onValueChange={(value) => onSelectMethod(value as DepositMethodId)}
        aria-label="Deposit method"
        className="grid grid-cols-2 gap-1 rounded-full border border-midnight-600 bg-midnight-850 p-1"
      >
        {depositMethods.map(({ id, segmentLabel, Icon }) => {
          const isActive = id === methodId

          return (
            <RadioGroup.Item
              key={id}
              value={id}
              className="relative flex min-h-11 items-center justify-center rounded-full px-3"
            >
              {isActive ? (
                <motion.span
                  layoutId="deposit-method-pill"
                  transition={shouldReduceMotion ? { duration: 0 } : pillSpring}
                  className="absolute inset-0 rounded-full bg-brand"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  'relative flex items-center gap-2 text-sm font-bold transition-colors',
                  isActive ? 'text-on-brand' : 'text-muted',
                )}
              >
                <Icon className="size-4" strokeWidth={2.2} aria-hidden="true" />
                {segmentLabel}
              </span>
            </RadioGroup.Item>
          )
        })}
      </RadioGroup.Root>

      <div className="flex flex-col gap-3">
        <p
          id={groupLabelId}
          className="text-xs font-bold uppercase tracking-[0.1em] text-faint"
        >
          Choose how you'd like to add funds
        </p>

        <RadioGroup.Root
          value={methodId}
          onValueChange={(value) => onSelectMethod(value as DepositMethodId)}
          aria-labelledby={groupLabelId}
          className="flex flex-col gap-3"
        >
          {depositMethods.map(
            ({ id, title, highlight, highlightClassName, description, Icon }) => {
              const isSelected = id === methodId

              return (
                <RadioGroup.Item
                  key={id}
                  value={id}
                  className={cn(
                    panelVariants({
                      tone: isSelected ? 'selected' : 'default',
                      padding: 'md',
                    }),
                    'flex w-full items-start gap-3.5 text-left transition-colors',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-11 shrink-0 place-items-center rounded-md transition-colors',
                      isSelected
                        ? 'bg-brand text-on-brand'
                        : 'bg-midnight-700 text-midnight-200',
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[1.0625rem] font-extrabold text-ink">
                      {title}
                    </span>
                    <span
                      className={cn(
                        'text-[0.8125rem] font-bold leading-snug',
                        highlightClassName,
                      )}
                    >
                      {highlight}
                    </span>
                    <span className="text-[0.8125rem] leading-relaxed text-muted">
                      {description}
                    </span>
                  </span>

                  <span
                    className={cn(
                      'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      isSelected ? 'border-mint' : 'border-midnight-500',
                    )}
                    aria-hidden="true"
                  >
                    <RadioGroup.Indicator className="block size-3 rounded-full bg-mint" />
                  </span>
                </RadioGroup.Item>
              )
            },
          )}
        </RadioGroup.Root>
      </div>

      <InfoCard
        icon={<ShieldCheck className="size-5" strokeWidth={2.2} />}
        title="You're in control"
        body="Choose the method that works best for you. You can always change it later."
      />
    </div>
  )
}
