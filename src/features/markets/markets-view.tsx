import * as Tabs from '@radix-ui/react-tabs'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { cn } from '../../lib/cn'
import {
  mockPredictionMarkets,
  mockTrendingTokens,
} from '../../lib/mock/mock-data'
import { PredictionMarketCard } from './components/prediction-market-card'
import { TrendingTokenRow } from './components/trending-token-row'

interface MarketsViewProps {
  onAskDilo: (prompt: string) => void
}

type MarketsSegment = 'trending' | 'predictions'

interface SegmentDefinition {
  id: MarketsSegment
  label: string
}

const segments: readonly SegmentDefinition[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'predictions', label: 'Predictions' },
]

const pillSpring = { type: 'spring' as const, stiffness: 420, damping: 32 }

export function MarketsView({ onAskDilo }: MarketsViewProps) {
  const [segment, setSegment] = useState<MarketsSegment>('trending')
  const isReducedMotion = useReducedMotion() ?? false

  return (
    <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none px-5 pb-4">
      <div className="pb-3">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em] text-ink">
          Markets
        </h1>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">
          What is moving on Solana today, and the open questions people are
          trading.
        </p>
      </div>

      <Tabs.Root
        value={segment}
        onValueChange={(value) => setSegment(value as MarketsSegment)}
      >
        <Tabs.List
          aria-label="Market categories"
          className="sticky top-0 z-10 -mx-5 grid grid-cols-2 gap-1 bg-midnight-900/85 px-5 py-2 backdrop-blur-xl"
        >
          {segments.map(({ id, label }) => {
            const isActive = id === segment

            return (
              <Tabs.Trigger
                key={id}
                value={id}
                className={cn(
                  'relative flex min-h-11 items-center justify-center rounded-md border text-sm font-bold transition-colors',
                  isActive
                    ? 'border-transparent text-ink'
                    : 'border-midnight-700 bg-midnight-900 text-muted hover:text-ink',
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="markets-segment"
                    transition={isReducedMotion ? { duration: 0 } : pillSpring}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-md bg-midnight-800 ring-1 ring-violet-neon/40"
                  />
                ) : null}
                <span className="relative">{label}</span>
              </Tabs.Trigger>
            )
          })}
        </Tabs.List>

        <Tabs.Content value="trending" className="pt-2 focus-visible:outline-none">
          <ul className="flex flex-col gap-2.5">
            {mockTrendingTokens.map((token, index) => (
              <TrendingTokenRow
                key={token.symbol}
                token={token}
                index={index}
                isReducedMotion={isReducedMotion}
                onAsk={onAskDilo}
              />
            ))}
          </ul>
        </Tabs.Content>

        <Tabs.Content
          value="predictions"
          className="pt-2 focus-visible:outline-none"
        >
          <ul className="flex flex-col gap-2.5">
            {mockPredictionMarkets.map((market, index) => (
              <PredictionMarketCard
                key={market.id}
                market={market}
                index={index}
                isReducedMotion={isReducedMotion}
                onAsk={onAskDilo}
              />
            ))}
          </ul>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
