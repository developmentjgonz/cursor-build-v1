import { motion, useReducedMotion } from 'motion/react'
import { CreditCard, Lock, User, Zap } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { Panel } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatCompactUsd } from '../../../lib/format'
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  type CardDetails,
} from '../card-details'
import { quickAmountsUsd } from '../deposit-model'

interface CardStepProps {
  amountInput: string
  amountUsd: number
  card: CardDetails
  onChangeAmount: (value: string) => void
  onSelectQuickAmount: (valueUsd: number) => void
  onChangeCard: (card: CardDetails) => void
}

export function CardStep({
  amountInput,
  amountUsd,
  card,
  onChangeAmount,
  onSelectQuickAmount,
  onChangeCard,
}: CardStepProps) {
  const shouldReduceMotion = useReducedMotion()
  const amountInputId = useId()
  const currencyId = useId()
  const quickLabelId = useId()

  return (
    <div className="flex flex-col gap-6 pt-2 pb-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
          Card deposit
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Add funds to your Dilo wallet with your card.
        </p>
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Panel
          tone="brand"
          padding="lg"
          className="flex flex-col gap-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aqua"
        >
          <label
            htmlFor={amountInputId}
            className="text-[0.9375rem] font-bold text-muted"
          >
            You deposit
          </label>

          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-extrabold tracking-[-0.03em] text-ink"
              aria-hidden="true"
            >
              $
            </span>
            <input
              id={amountInputId}
              value={amountInput}
              onChange={(event) => onChangeAmount(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              aria-describedby={currencyId}
              className="w-full min-w-0 bg-transparent text-5xl font-extrabold tracking-[-0.03em] text-ink tabular-nums placeholder:text-faint focus:outline-none"
            />
            <span
              id={currencyId}
              className="shrink-0 rounded-full border border-midnight-600 bg-midnight-850 px-3 py-1.5 text-[0.8125rem] font-bold text-ink"
            >
              USD
            </span>
          </div>

          <p className="flex items-center gap-2 text-[0.8125rem] font-bold text-mint">
            <Zap className="size-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            Funds available instantly
          </p>
        </Panel>
      </motion.div>

      <div className="flex flex-col gap-2.5">
        <p
          id={quickLabelId}
          className="text-xs font-bold uppercase tracking-[0.1em] text-faint"
        >
          Quick amounts
        </p>
        <div className="flex gap-2" role="group" aria-labelledby={quickLabelId}>
          {quickAmountsUsd.map((value) => {
            const isActive = amountUsd === value

            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelectQuickAmount(value)}
                aria-pressed={isActive}
                className={cn(
                  'min-h-11 flex-1 rounded-full border px-2 text-[0.9375rem] font-bold transition-colors tabular-nums',
                  isActive
                    ? 'border-mint bg-midnight-800 text-mint'
                    : 'border-midnight-600 bg-midnight-850 text-muted',
                )}
              >
                {formatCompactUsd(value)}
              </button>
            )
          })}
        </div>
      </div>

      <Panel tone="raised" padding="lg" className="flex flex-col gap-4">
        <h2 className="text-[1.0625rem] font-extrabold text-ink">Card details</h2>

        <CardField
          label="Card number"
          value={formatCardNumber(card.number)}
          onChange={(value) =>
            onChangeCard({ ...card, number: formatCardNumber(value) })
          }
          placeholder="1234 1234 1234 1234"
          inputMode="numeric"
          autoComplete="cc-number"
          leading={<CreditCard className="size-4" strokeWidth={2.2} />}
        />

        <div className="grid grid-cols-2 gap-3">
          <CardField
            label="Expiry date"
            value={card.expiry}
            onChange={(value) =>
              onChangeCard({ ...card, expiry: formatExpiry(value) })
            }
            placeholder="MM / YY"
            inputMode="numeric"
            autoComplete="cc-exp"
          />
          <CardField
            label="CVC"
            value={card.cvc}
            onChange={(value) => onChangeCard({ ...card, cvc: formatCvc(value) })}
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
          />
        </div>

        <CardField
          label="Name on card"
          value={card.name}
          onChange={(value) => onChangeCard({ ...card, name: value })}
          placeholder="Alex Rivera"
          inputMode="text"
          autoComplete="cc-name"
          leading={<User className="size-4" strokeWidth={2.2} />}
        />
      </Panel>

      <p className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-faint">
        <Lock
          className="mt-0.5 size-4 shrink-0 text-mint"
          strokeWidth={2.2}
          aria-hidden="true"
        />
        Your payment information is encrypted and never stored on our servers.
      </p>
    </div>
  )
}

interface CardFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete: string
  leading?: ReactNode
}

function CardField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
  leading,
}: CardFieldProps) {
  const fieldId = useId()

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[0.8125rem] font-bold text-muted">
        {label}
      </label>
      <div className="flex min-h-11 items-center gap-2.5 rounded-md border border-midnight-600 bg-midnight-800 px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-aqua">
        {leading ? (
          <span className="shrink-0 text-faint" aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <input
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          spellCheck={false}
          className="w-full min-w-0 bg-transparent py-2 text-[0.9375rem] text-ink tabular-nums placeholder:text-faint focus:outline-none"
        />
      </div>
    </div>
  )
}
