import { Panel } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatUsd } from '../../../lib/format'
import type { PaymentMethod } from './payment-methods'

interface ReviewStepProps {
  amountUsd: number
  feeUsd: number
  totalUsd: number
  method: PaymentMethod
}

interface SummaryRowProps {
  label: string
  value: string
  isTotal?: boolean
}

export function ReviewStep({
  amountUsd,
  feeUsd,
  totalUsd,
  method,
}: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em]">
          Check the details
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Nothing is charged until you confirm.
        </p>
      </div>

      <Panel tone="raised" padding="lg" className="flex flex-col gap-3">
        <dl className="flex flex-col gap-3">
          <SummaryRow label="Amount" value={formatUsd(amountUsd)} />
          <SummaryRow label="Paying with" value={method.label} />
          <SummaryRow label="Fee" value={formatUsd(feeUsd)} />
          <div className="h-px bg-midnight-600" aria-hidden="true" />
          <SummaryRow label="Total" value={formatUsd(totalUsd)} isTotal />
        </dl>
      </Panel>

      <p className="text-[0.8125rem] leading-relaxed text-faint">
        {method.arrival}. The balance lands in your Dilo wallet, which only you
        can sign from.
      </p>
    </div>
  )
}

function SummaryRow({ label, value, isTotal = false }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt
        className={cn(
          'text-[0.9375rem]',
          isTotal ? 'font-bold text-ink' : 'text-muted',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'text-right tabular-nums',
          isTotal
            ? 'text-lg font-extrabold text-ink'
            : 'text-[0.9375rem] font-bold text-ink',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
