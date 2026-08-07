import { Delete } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { formatUsd } from '../../../lib/format'

export type AmountKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '.'
  | 'backspace'

interface AmountKeypadProps {
  onKeyPress: (key: AmountKey) => void
}

const keypadKeys: readonly AmountKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  '0',
  'backspace',
]

const maxWholeDigits = 6
const maxFractionDigits = 2

export function AmountKeypad({ onKeyPress }: AmountKeypadProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="Amount keypad"
    >
      {keypadKeys.map((key) => {
        const isBackspace = key === 'backspace'

        return (
          <Button
            key={key}
            variant="subtle"
            size="lg"
            onClick={() => onKeyPress(key)}
            aria-label={isBackspace ? 'Delete last digit' : undefined}
            className="min-h-14 text-xl text-ink tabular-nums"
          >
            {isBackspace ? (
              <Delete className="size-5" strokeWidth={2.2} aria-hidden="true" />
            ) : (
              key
            )}
          </Button>
        )
      })}
    </div>
  )
}

// The raw keypad string is the source of truth so a trailing "." or a single
// decimal digit survives until the next key press.
export function applyAmountKey(input: string, key: AmountKey): string {
  if (key === 'backspace') {
    return input.slice(0, -1)
  }

  const dotIndex = input.indexOf('.')

  if (key === '.') {
    if (dotIndex !== -1) {
      return input
    }

    return input === '' ? '0.' : `${input}.`
  }

  if (dotIndex !== -1) {
    const fraction = input.slice(dotIndex + 1)

    return fraction.length >= maxFractionDigits ? input : `${input}${key}`
  }

  if (input === '0') {
    return key
  }

  return input.length >= maxWholeDigits ? input : `${input}${key}`
}

export function parseAmountInput(input: string): number {
  const parsed = Number.parseFloat(input)

  return Number.isFinite(parsed) ? parsed : 0
}

// Groups the whole part through formatUsd, then re-attaches the decimals
// exactly as typed so the display never contradicts the keypad.
export function formatKeypadAmount(input: string): string {
  const dotIndex = input.indexOf('.')
  const whole = dotIndex === -1 ? input : input.slice(0, dotIndex)
  const wholeLabel = formatUsd(Number(whole || '0')).replace(/\.00$/, '')

  if (dotIndex === -1) {
    return wholeLabel
  }

  return `${wholeLabel}.${input.slice(dotIndex + 1)}`
}
