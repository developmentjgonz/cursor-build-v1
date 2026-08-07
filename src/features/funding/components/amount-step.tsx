import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'
import { formatUsd } from '../../../lib/format'
import { AmountKeypad, formatKeypadAmount, type AmountKey } from './amount-keypad'

interface AmountStepProps {
  amountInput: string
  amountUsd: number
  minimumUsd: number
  onKeyPress: (key: AmountKey) => void
  onQuickPick: (amountUsd: number) => void
}

const quickPickAmounts: readonly number[] = [25, 50, 100, 250]

export function AmountStep({
  amountInput,
  amountUsd,
  minimumUsd,
  onKeyPress,
  onQuickPick,
}: AmountStepProps) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-col items-center gap-1.5 pt-2">
        <h1 className="text-xs font-bold uppercase tracking-[0.12em] text-faint">
          How much do you want to add?
        </h1>
        <p
          className="text-brand text-5xl font-extrabold tracking-[-0.04em] tabular-nums"
          aria-hidden="true"
        >
          {formatKeypadAmount(amountInput)}
        </p>
        <p className="sr-only" aria-live="polite">
          Deposit amount {formatUsd(amountUsd)}
        </p>
        <p className="text-[0.8125rem] text-faint">
          {formatUsd(minimumUsd)} minimum
        </p>
      </div>

      <div
        className="flex items-stretch gap-2"
        role="group"
        aria-label="Suggested amounts"
      >
        {quickPickAmounts.map((value) => {
          const isActive = amountUsd === value

          return (
            <Button
              key={value}
              variant={isActive ? 'outline' : 'subtle'}
              size="sm"
              onClick={() => onQuickPick(value)}
              aria-pressed={isActive}
              className={cn(
                'min-h-11 flex-1 rounded-full px-2 tabular-nums',
                isActive && 'border-mint text-ink',
              )}
            >
              {formatUsd(value)}
            </Button>
          )
        })}
      </div>

      <div className="mt-auto">
        <AmountKeypad onKeyPress={onKeyPress} />
      </div>
    </div>
  )
}
