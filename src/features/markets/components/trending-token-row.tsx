import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import { ChangeBadge } from '../../../components/ui/change-badge'
import { panelVariants } from '../../../components/ui/panel'
import { Sparkline } from '../../../components/ui/sparkline'
import { cn } from '../../../lib/cn'
import { formatCompactUsd, formatPrice } from '../../../lib/format'
import type { TrendingToken } from '../../../lib/mock/mock-data'
import { AssetRow } from './asset-row'
import { pressSpring } from './motion'

interface TrendingTokenRowProps {
  token: TrendingToken
  onAsk: (prompt: string) => void
}

export function TrendingTokenRow({ token, onAsk }: TrendingTokenRowProps) {
  const prompt = buildSwapPrompt(token.symbol)

  return (
    <li>
      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        transition={pressSpring}
        onClick={() => onAsk(prompt)}
        className={cn(
          panelVariants({ tone: 'raised', padding: 'md' }),
          'w-full text-left transition-colors',
          'hover:border-aqua hover:bg-midnight-800',
          'active:border-aqua active:bg-midnight-850',
        )}
      >
        <AssetRow
          symbol={token.symbol}
          caption={token.name}
          media={
            <Sparkline
              values={token.trend}
              isPositive={token.change24hPercentage >= 0}
              width={44}
              height={22}
            />
          }
          value={formatPrice(token.priceUsd)}
          trailing={<ChangeBadge value={token.change24hPercentage} />}
        />

        <span className="mt-3 flex items-center justify-between gap-3 border-t border-midnight-700 pt-3 text-[0.75rem]">
          <span className="min-w-0 truncate text-faint">
            Liquidity{' '}
            <span className="font-bold tabular-nums text-muted">
              {formatCompactUsd(token.volume24hUsd)}
            </span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 font-bold text-violet-neon">
            <Sparkles className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
            Ask Dilo
            <span className="sr-only">: {prompt}</span>
          </span>
        </span>
      </motion.button>
    </li>
  )
}

function buildSwapPrompt(symbol: string): string {
  return `Swap 0.1 SOL for ${symbol}`
}
