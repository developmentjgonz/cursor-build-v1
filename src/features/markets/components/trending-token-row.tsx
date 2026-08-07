import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import { ChangeBadge } from '../../../components/ui/change-badge'
import { panelVariants } from '../../../components/ui/panel'
import { Sparkline } from '../../../components/ui/sparkline'
import { TokenMark } from '../../../components/ui/token-mark'
import { cn } from '../../../lib/cn'
import { formatCompactUsd, formatPrice } from '../../../lib/format'
import type { TrendingToken } from '../../../lib/mock/mock-data'
import { getStaggerProps } from './stagger'

interface TrendingTokenRowProps {
  token: TrendingToken
  index: number
  isReducedMotion: boolean
  onAsk: (prompt: string) => void
}

export function TrendingTokenRow({
  token,
  index,
  isReducedMotion,
  onAsk,
}: TrendingTokenRowProps) {
  const prompt = buildSwapPrompt(token.symbol)

  return (
    <motion.li {...getStaggerProps(index, isReducedMotion)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={() => onAsk(prompt)}
        className={cn(
          panelVariants({ tone: 'raised', padding: 'md' }),
          'w-full text-left transition-colors hover:border-midnight-500',
        )}
      >
        <span className="flex items-center gap-3">
          <TokenMark symbol={token.symbol} />

          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[0.9375rem] font-bold text-ink">
              {token.symbol}
            </span>
            <span className="truncate text-[0.8125rem] text-faint">
              {token.name}
            </span>
          </span>

          <Sparkline
            values={token.trend}
            isPositive={token.change24hPercentage >= 0}
            width={52}
            height={24}
          />

          <span className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[0.9375rem] font-bold tabular-nums text-ink">
              {formatPrice(token.priceUsd)}
            </span>
            <ChangeBadge value={token.change24hPercentage} />
          </span>
        </span>

        <span className="mt-3 flex items-center justify-between border-t border-midnight-700 pt-2.5 text-[0.75rem]">
          <span className="text-faint">
            24h volume{' '}
            <span className="font-bold tabular-nums text-muted">
              {formatCompactUsd(token.volume24hUsd)}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-violet-neon">
            <Sparkles className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
            Ask Dilo
            <span className="sr-only">: {prompt}</span>
          </span>
        </span>
      </motion.button>
    </motion.li>
  )
}

function buildSwapPrompt(symbol: string): string {
  return `Swap 0.1 SOL for ${symbol}`
}
