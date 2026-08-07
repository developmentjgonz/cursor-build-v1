import * as RadioGroup from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'
import { useId } from 'react'

import { panelVariants } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatUsd } from '../../../lib/format'
import {
  calculateFeeUsd,
  paymentMethods,
  type PaymentMethodId,
} from './payment-methods'

interface MethodStepProps {
  amountUsd: number
  selectedMethodId: PaymentMethodId
  onSelectMethod: (methodId: PaymentMethodId) => void
}

export function MethodStep({
  amountUsd,
  selectedMethodId,
  onSelectMethod,
}: MethodStepProps) {
  const headingId = useId()

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-2">
        <h1
          id={headingId}
          className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em]"
        >
          How do you want to pay?
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Adding {formatUsd(amountUsd)}. Fees are shown before you confirm.
        </p>
      </div>

      <RadioGroup.Root
        value={selectedMethodId}
        onValueChange={(value) => onSelectMethod(value as PaymentMethodId)}
        aria-labelledby={headingId}
        className="flex flex-col gap-3"
      >
        {paymentMethods.map(({ id, label, feeRate, arrival, Icon }) => {
          const isSelected = id === selectedMethodId
          const feeUsd = calculateFeeUsd(amountUsd, feeRate)
          const feeLabel = feeRate === 0 ? 'No fee' : `${formatUsd(feeUsd)} fee`

          return (
            <RadioGroup.Item
              key={id}
              value={id}
              className={cn(
                panelVariants({
                  tone: isSelected ? 'selected' : 'default',
                  padding: 'md',
                }),
                'flex min-h-11 w-full items-center gap-3.5 text-left transition-colors',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-full border transition-colors',
                  isSelected
                    ? 'border-mint bg-midnight-700 text-mint'
                    : 'border-midnight-600 bg-midnight-700 text-midnight-200',
                )}
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={2.2} />
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.9375rem] font-bold text-ink">
                  {label}
                </span>
                <span className="text-[0.8125rem] text-muted tabular-nums">
                  {feeLabel}
                </span>
                <span className="text-[0.8125rem] text-faint">{arrival}</span>
              </span>

              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border transition-colors',
                  isSelected
                    ? 'border-mint bg-mint text-on-brand'
                    : 'border-midnight-500',
                )}
                aria-hidden="true"
              >
                <RadioGroup.Indicator>
                  <Check className="size-4" strokeWidth={3} />
                </RadioGroup.Indicator>
              </span>
            </RadioGroup.Item>
          )
        })}
      </RadioGroup.Root>
    </div>
  )
}
