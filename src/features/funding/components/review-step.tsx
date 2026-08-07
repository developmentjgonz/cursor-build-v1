import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowDownToLine,
  Banknote,
  CreditCard,
  Info,
  Landmark,
  Receipt,
  Wallet,
} from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

import { Panel } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatUsd } from '../../../lib/format'
import {
  getCardBrand,
  getCardLastFour,
  type CardDetails,
} from '../card-details'
import { cardFeeRate, type DepositMethodId } from '../deposit-model'

interface ReviewStepProps {
  amountUsd: number
  feeUsd: number
  netUsd: number
  methodId: DepositMethodId
  card: CardDetails
}

const rowSpring = { type: 'spring' as const, stiffness: 320, damping: 34 }

export function ReviewStep({
  amountUsd,
  feeUsd,
  netUsd,
  methodId,
  card,
}: ReviewStepProps) {
  const shouldReduceMotion = useReducedMotion()
  const [isFeeOpen, setIsFeeOpen] = useState(false)
  const feePanelId = useId()

  const isCard = methodId === 'card'
  const feePercentLabel = `${Math.round(cardFeeRate * 100)}%`
  const lastFour = getCardLastFour(card)
  const brand = getCardBrand(card)

  return (
    <div className="flex flex-col gap-5 pt-1 pb-2">
      <div className="flex justify-center pt-1">
        <span className="grid size-24 place-items-center rounded-full bg-brand p-[2px] shadow-glow-violet">
          <span className="grid size-full place-items-center rounded-full bg-midnight-850">
            <Wallet
              className="size-10 text-violet-neon"
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </span>
        </span>
      </div>

      <Panel tone="brand" padding="lg" className="flex items-center gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-md bg-midnight-700 text-mint"
          aria-hidden="true"
        >
          <Banknote className="size-6" strokeWidth={2} />
        </span>
        <p className="min-w-0 text-[0.9375rem] leading-relaxed text-muted">
          You&rsquo;re adding{' '}
          <strong className="text-brand block text-[2rem] font-extrabold leading-tight tracking-[-0.03em] tabular-nums">
            {formatUsd(amountUsd)} USD
          </strong>{' '}
          to your Dilo wallet.
        </p>
      </Panel>

      <Panel tone="default" padding="lg">
        <dl className="flex flex-col">
          <SummaryRow
            index={0}
            shouldReduceMotion={shouldReduceMotion}
            icon={<Receipt className="size-5" strokeWidth={2} />}
            label="Amount"
            value={formatUsd(amountUsd)}
          />

          <SummaryRow
            index={1}
            hasDivider
            shouldReduceMotion={shouldReduceMotion}
            icon={<CreditCard className="size-5" strokeWidth={2} />}
            label={isCard ? 'Card fee' : 'ACH fee'}
            value={formatUsd(feeUsd)}
            action={
              <button
                type="button"
                onClick={() => setIsFeeOpen((isOpen) => !isOpen)}
                aria-expanded={isFeeOpen}
                aria-controls={feePanelId}
                className="grid size-11 place-items-center rounded-full text-faint transition-colors hover:text-ink"
              >
                <Info className="size-4" strokeWidth={2.2} aria-hidden="true" />
                <span className="sr-only">How this fee is calculated</span>
              </button>
            }
          />

          <AnimatePresence initial={false}>
            {isFeeOpen ? (
              <motion.div
                id={feePanelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <dt className="sr-only">How this fee is calculated</dt>
                <dd className="pb-3 pl-12 text-[0.8125rem] leading-relaxed text-faint">
                  {isCard
                    ? `Card deposits carry a ${feePercentLabel} processing fee. ${formatUsd(amountUsd)} at ${feePercentLabel} is ${formatUsd(feeUsd)}, taken out of the deposit rather than charged separately.`
                    : 'ACH transfers settle straight from your bank, so Dilo charges nothing and the full amount reaches your wallet.'}
                </dd>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <SummaryRow
            index={2}
            hasDivider
            shouldReduceMotion={shouldReduceMotion}
            icon={<ArrowDownToLine className="size-5" strokeWidth={2} />}
            label="You'll receive"
            value={formatUsd(netUsd)}
            isTotal
          />
        </dl>
      </Panel>

      <Panel tone="raised" padding="md" className="flex items-center gap-3.5">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-md bg-midnight-700 text-aqua"
          aria-hidden="true"
        >
          {isCard ? (
            <CreditCard className="size-5" strokeWidth={2.2} />
          ) : (
            <Landmark className="size-5" strokeWidth={2.2} />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[0.9375rem] font-bold text-ink">Paying with</span>
          <span className="text-[0.8125rem] text-muted">
            {isCard
              ? `${brand} ending in ${lastFour}`
              : 'Bank account via ACH transfer'}
          </span>
        </span>
        {isCard ? (
          <span
            className="shrink-0 text-[0.8125rem] font-bold text-faint tabular-nums"
            aria-hidden="true"
          >
            •••• {lastFour}
          </span>
        ) : null}
      </Panel>
    </div>
  )
}

interface SummaryRowProps {
  index: number
  shouldReduceMotion: boolean | null
  icon: ReactNode
  label: string
  value: string
  action?: ReactNode
  isTotal?: boolean
  hasDivider?: boolean
}

function SummaryRow({
  index,
  shouldReduceMotion,
  icon,
  label,
  value,
  action,
  isTotal = false,
  hasDivider = false,
}: SummaryRowProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...rowSpring, delay: index * 0.04 }}
      className={cn(
        'flex items-center gap-3 py-3',
        hasDivider && 'border-t border-midnight-700',
      )}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-sm bg-midnight-700',
          isTotal ? 'text-mint' : 'text-midnight-200',
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <dt className="flex min-w-0 flex-1 items-center gap-0.5 text-[0.9375rem] font-bold text-ink">
        {label}
        {action}
      </dt>
      <dd
        className={cn(
          'shrink-0 text-right font-extrabold tabular-nums',
          isTotal
            ? 'text-brand text-2xl tracking-[-0.03em]'
            : 'text-[0.9375rem] text-ink',
        )}
      >
        {value}
      </dd>
    </motion.div>
  )
}
