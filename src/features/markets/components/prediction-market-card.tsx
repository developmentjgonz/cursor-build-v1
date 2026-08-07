import { Check, Clock, X } from 'lucide-react'
import { motion } from 'motion/react'

import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import { formatCompactUsd } from '../../../lib/format'
import type { PredictionMarketSummary } from '../../../lib/mock/mock-data'
import { ProbabilityBar } from './probability-bar'
import { getStaggerProps } from './stagger'

interface PredictionMarketCardProps {
  market: PredictionMarketSummary
  index: number
  isReducedMotion: boolean
  onAsk: (prompt: string) => void
}

export function PredictionMarketCard({
  market,
  index,
  isReducedMotion,
  onAsk,
}: PredictionMarketCardProps) {
  const titleId = `market-title-${market.id}`

  return (
    <motion.li {...getStaggerProps(index, isReducedMotion)}>
      <Panel tone="raised" padding="md" className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-midnight-600 bg-midnight-800 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">
            {market.category}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.75rem] tabular-nums text-faint">
            <Clock className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            {market.closesAt}
          </span>
        </div>

        <h3
          id={titleId}
          className="text-[0.9375rem] font-bold leading-snug text-ink"
        >
          {market.title}
        </h3>

        <ProbabilityBar
          yesProbability={market.yesProbability}
          label={`Yes probability for ${market.title}`}
          delaySeconds={isReducedMotion ? 0 : index * 0.04 + 0.06}
          isReducedMotion={isReducedMotion}
        />

        <p className="text-[0.75rem] text-faint">
          Volume{' '}
          <span className="font-bold tabular-nums text-muted">
            {formatCompactUsd(market.volumeUsd)}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => onAsk(buildBetPrompt(market.title, 'YES'))}
            aria-describedby={titleId}
          >
            <Check className="size-4 text-up" strokeWidth={2.6} aria-hidden="true" />
            Buy YES
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => onAsk(buildBetPrompt(market.title, 'NO'))}
            aria-describedby={titleId}
          >
            <X className="size-4 text-down" strokeWidth={2.6} aria-hidden="true" />
            Buy NO
          </Button>
        </div>
      </Panel>
    </motion.li>
  )
}

function buildBetPrompt(title: string, outcome: 'YES' | 'NO'): string {
  return `Bet $5 on ${outcome} for "${title}"`
}
