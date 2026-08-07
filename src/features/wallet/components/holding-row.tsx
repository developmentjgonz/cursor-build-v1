import { motion } from 'motion/react'

import { ChangeBadge } from '../../../components/ui/change-badge'
import { TokenMark } from '../../../components/ui/token-mark'
import { formatTokenAmount, formatUsd } from '../../../lib/format'
import type { WalletHolding } from '../../../lib/mock/mock-data'
import { getStaggerProps } from './stagger'

interface HoldingRowProps {
  holding: WalletHolding
  index: number
  isReducedMotion: boolean
}

export function HoldingRow({ holding, index, isReducedMotion }: HoldingRowProps) {
  return (
    <motion.li
      {...getStaggerProps(index, isReducedMotion)}
      className="flex items-center gap-3 px-4 py-3"
    >
      <TokenMark symbol={holding.symbol} />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-baseline gap-2">
          <strong className="text-[0.9375rem] font-bold text-ink">
            {holding.symbol}
          </strong>
          <span className="truncate text-[0.8125rem] text-faint">
            {holding.name}
          </span>
        </span>
        <span className="text-[0.8125rem] tabular-nums text-muted">
          {formatTokenAmount(holding.amount, holding.symbol)}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[0.9375rem] font-bold tabular-nums text-ink">
          {formatUsd(holding.valueUsd)}
        </span>
        {holding.change24hPercentage === 0 ? (
          <span className="rounded-full bg-midnight-700 px-2 py-0.5 text-[0.75rem] font-bold text-muted">
            Flat
            <span className="sr-only"> over the last 24 hours</span>
          </span>
        ) : (
          <ChangeBadge value={holding.change24hPercentage} />
        )}
      </span>
    </motion.li>
  )
}
