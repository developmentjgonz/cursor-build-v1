import { Check, Clock, X } from 'lucide-react'

import type { PredictionMarket } from '../../../../shared/contracts/prediction-market'
import { Button } from '../../../components/ui/button'
import { Panel } from '../../../components/ui/panel'
import { formatCompactUsd } from '../../../lib/format'
import {
  formatMarketClosesAt,
  getMarketCategory,
} from '../../../lib/prediction/market-presentation'
import { ProbabilityBar } from './probability-bar'

interface PredictionMarketCardProps {
  market: PredictionMarket
  index: number
  isReducedMotion: boolean
  onAsk: (prompt: string) => void
}

// The bars are the one expressive moment on this tab, so their fill is the only
// thing that leans on the index for a delay. It caps so a long list never has a
// bar still filling after the entrance should have settled.
const barDelayStepSeconds = 0.05
const maxBarDelaySeconds = 0.24

export function PredictionMarketCard({
  market,
  index,
  isReducedMotion,
  onAsk,
}: PredictionMarketCardProps) {
  const titleId = `market-title-${market.id}`
  const barDelaySeconds = isReducedMotion
    ? 0
    : Math.min(index * barDelayStepSeconds + 0.08, maxBarDelaySeconds)

  return (
    <li>
      <Panel tone="raised" padding="md">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate rounded-full border border-midnight-600 bg-midnight-800 px-2.5 py-1 text-[0.75rem] font-bold tracking-[0.08em] text-muted uppercase">
            {getMarketCategory(market)}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.75rem] tabular-nums text-faint">
            <Clock className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            {formatMarketClosesAt(market.closesAt)}
          </span>
        </div>

        <h3 id={titleId} className="mt-3 text-base leading-snug font-bold text-ink">
          {market.title}
        </h3>

        <ProbabilityBar
          className="mt-3.5"
          yesProbability={market.yesProbability}
          label={`Yes probability for ${market.title}`}
          delaySeconds={barDelaySeconds}
          isReducedMotion={isReducedMotion}
        />

        {market.volumeUsd !== undefined ? (
          <p className="mt-2 text-[0.75rem] text-faint">
            Volume{' '}
            <span className="font-bold tabular-nums text-muted">
              {formatCompactUsd(market.volumeUsd)}
            </span>
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => onAsk(buildBetPrompt(market.title, 'YES'))}
            aria-describedby={titleId}
            className="hover:bg-midnight-850 active:bg-midnight-900"
          >
            <Check className="size-4 text-up" strokeWidth={2.6} aria-hidden="true" />
            Buy YES
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => onAsk(buildBetPrompt(market.title, 'NO'))}
            aria-describedby={titleId}
            className="hover:bg-midnight-850 active:bg-midnight-900"
          >
            <X className="size-4 text-down" strokeWidth={2.6} aria-hidden="true" />
            Buy NO
          </Button>
        </div>
      </Panel>
    </li>
  )
}

function buildBetPrompt(title: string, outcome: 'YES' | 'NO'): string {
  return `Bet $5 on ${outcome} for "${title}"`
}
