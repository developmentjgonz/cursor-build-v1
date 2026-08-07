import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '../../lib/cn'
import { formatSignedPercentage } from '../../lib/format'

interface ChangeBadgeProps {
  value: number
  size?: 'sm' | 'md'
  hasIcon?: boolean
  className?: string
}

export function ChangeBadge({
  value,
  size = 'sm',
  hasIcon = true,
  className,
}: ChangeBadgeProps) {
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold tabular-nums',
        isPositive ? 'bg-up/12 text-up' : 'bg-down/12 text-down',
        size === 'sm' ? 'px-2 py-0.5 text-[0.75rem]' : 'px-2.5 py-1 text-[0.8125rem]',
        className,
      )}
    >
      {hasIcon ? (
        <Icon className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
      ) : null}
      {formatSignedPercentage(value)}
      <span className="sr-only">
        {isPositive ? ' increase' : ' decrease'} in the last 24 hours
      </span>
    </span>
  )
}
