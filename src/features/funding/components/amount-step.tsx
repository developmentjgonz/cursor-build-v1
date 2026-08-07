import * as RadioGroup from '@radix-ui/react-radio-group'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronRight, Clock, Plus, Star } from 'lucide-react'
import { useId } from 'react'

import { InfoCard, panelVariants } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatCompactUsd, formatUsd } from '../../../lib/format'
import { amountPresets } from '../deposit-model'
import { DepositHero } from './deposit-hero'

export type AmountSource = 'preset' | 'custom'

interface AmountStepProps {
  amountInput: string
  amountUsd: number
  amountSource: AmountSource
  isCustomOpen: boolean
  onSelectPreset: (valueUsd: number) => void
  onToggleCustom: () => void
  onChangeCustom: (value: string) => void
}

const cardSpring = { type: 'spring' as const, stiffness: 320, damping: 34 }

export function AmountStep({
  amountInput,
  amountUsd,
  amountSource,
  isCustomOpen,
  onSelectPreset,
  onToggleCustom,
  onChangeCustom,
}: AmountStepProps) {
  const shouldReduceMotion = useReducedMotion()
  const groupLabelId = useId()
  const customPanelId = useId()
  const customInputId = useId()

  const selectedPreset =
    amountSource === 'preset'
      ? amountPresets.find((preset) => preset.valueUsd === amountUsd)
      : undefined

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="flex flex-col items-center gap-3 pt-1 text-center">
        <DepositHero />

        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
            Add funds
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Start by adding USD to your wallet.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p
          id={groupLabelId}
          className="text-xs font-bold uppercase tracking-[0.1em] text-faint"
        >
          Recommended amounts
        </p>

        <RadioGroup.Root
          value={selectedPreset ? String(selectedPreset.valueUsd) : ''}
          onValueChange={(value) => onSelectPreset(Number(value))}
          aria-labelledby={groupLabelId}
          className="grid grid-cols-3 items-stretch gap-2 pt-2"
        >
          {amountPresets.map((preset, index) => {
            const isSelected = selectedPreset?.valueUsd === preset.valueUsd

            return (
              <motion.div
                key={preset.valueUsd}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...cardSpring, delay: index * 0.04 }}
              >
                <RadioGroup.Item
                  value={String(preset.valueUsd)}
                  aria-label={`${formatUsd(preset.valueUsd)} — ${preset.caption}`}
                  className={cn(
                    panelVariants({
                      tone: isSelected ? 'selected' : 'default',
                      padding: 'none',
                    }),
                    'relative flex h-full w-full flex-col items-center justify-center gap-1 px-2 pt-7 pb-4 transition-colors',
                  )}
                >
                  {preset.isPopular ? (
                    <span
                      className="absolute -top-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-violet-neon/60 bg-midnight-850 px-2 py-0.5 text-[0.75rem] font-bold text-violet-neon"
                      aria-hidden="true"
                    >
                      <Star className="size-3" strokeWidth={2.6} />
                      Popular
                    </span>
                  ) : null}

                  {isSelected ? (
                    <span
                      className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-mint text-on-brand"
                      aria-hidden="true"
                    >
                      <Check className="size-3.5" strokeWidth={3.2} />
                    </span>
                  ) : null}

                  <span
                    className="text-2xl font-extrabold tracking-[-0.03em] text-ink tabular-nums"
                    aria-hidden="true"
                  >
                    {formatCompactUsd(preset.valueUsd)}
                  </span>
                  <span
                    className={cn(
                      'text-[0.75rem] font-bold',
                      preset.captionClassName,
                    )}
                    aria-hidden="true"
                  >
                    {preset.caption}
                  </span>
                </RadioGroup.Item>
              </motion.div>
            )
          })}
        </RadioGroup.Root>

        <div>
          <button
            type="button"
            onClick={onToggleCustom}
            aria-expanded={isCustomOpen}
            aria-controls={customPanelId}
            className={cn(
              panelVariants({
                tone:
                  amountSource === 'custom' && amountUsd > 0
                    ? 'selected'
                    : 'default',
                padding: 'none',
              }),
              'flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors',
            )}
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full border border-dashed border-midnight-500 text-muted"
              aria-hidden="true"
            >
              <Plus className="size-4" strokeWidth={2.4} />
            </span>
            <span className="flex-1 text-[0.9375rem] font-bold text-ink">
              Add custom amount
            </span>
            <ChevronRight
              className={cn(
                'size-5 shrink-0 text-faint transition-transform duration-200',
                isCustomOpen && 'rotate-90',
              )}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {isCustomOpen ? (
              <motion.div
                id={customPanelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-3">
                  <label
                    htmlFor={customInputId}
                    className="text-[0.8125rem] font-bold text-muted"
                  >
                    Custom amount in USD
                  </label>
                  <div className="flex min-h-14 items-center gap-2 rounded-md border border-midnight-600 bg-midnight-800 px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aqua">
                    <span
                      className="text-xl font-extrabold text-faint"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <input
                      id={customInputId}
                      value={amountInput}
                      onChange={(event) => onChangeCustom(event.target.value)}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0"
                      className="w-full min-w-0 bg-transparent text-xl font-extrabold text-ink tabular-nums placeholder:font-bold placeholder:text-faint focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <InfoCard
        icon={<Clock className="size-5" strokeWidth={2.2} />}
        title="You can always add more later."
        body="There's no rush — fund your wallet in a way that feels right for you."
      />

      <p className="sr-only" aria-live="polite">
        {amountUsd > 0
          ? `Deposit amount ${formatUsd(amountUsd)}`
          : 'No deposit amount selected'}
      </p>
    </div>
  )
}
