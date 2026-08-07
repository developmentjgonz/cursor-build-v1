import * as Tabs from '@radix-ui/react-tabs'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

import { ScreenBody } from '../../components/ui/screen'
import { cn } from '../../lib/cn'
import { getGroupEntrance } from './components/motion'
import { PredictionMarketCard } from './components/prediction-market-card'
import { TrendingTokenRow } from './components/trending-token-row'
import { usePredictionMarkets } from './use-prediction-markets'
import { useTrendingTokens } from './use-trending-tokens'

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
  const groupEntrance = getGroupEntrance(isReducedMotion)
  const predictionMarkets = usePredictionMarkets()
  const trendingTokens = useTrendingTokens()

  return (
    <ScreenBody>
      <div className="pb-4">
        <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
          Markets
        </h1>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
          What is moving on Solana today, and the open questions people are
          trading.
        </p>
      </div>

      <Tabs.Root
        value={segment}
        onValueChange={(value) => setSegment(value as MarketsSegment)}
      >
        {/* Full-bleed blur band so rows scroll cleanly under the control. */}
        <div className="sticky top-0 z-10 -mx-5 bg-midnight-900/90 px-5 pb-3 backdrop-blur-xl">
          <Tabs.List
            aria-label="Market categories"
            className="grid grid-cols-2 gap-1 rounded-lg border border-midnight-700 bg-midnight-900 p-1"
          >
            {segments.map(({ id, label }) => {
              const isActive = id === segment

              return (
                <Tabs.Trigger
                  key={id}
                  value={id}
                  className={cn(
                    'relative flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-bold transition-colors',
                    isActive
                      ? 'text-ink'
                      : 'text-muted hover:bg-midnight-850 hover:text-ink active:bg-midnight-800',
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="markets-segment"
                      transition={isReducedMotion ? { duration: 0 } : pillSpring}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-md bg-midnight-800 ring-1 ring-violet-neon/45"
                    />
                  ) : null}
                  <span className="relative">{label}</span>
                </Tabs.Trigger>
              )
            })}
          </Tabs.List>
        </div>

        <Tabs.Content value="trending" className="focus-visible:outline-none">
          {trendingTokens.isLoading ? (
            <p className="py-8 text-sm text-muted" role="status">
              Loading live token prices…
            </p>
          ) : null}

          {!trendingTokens.isLoading && trendingTokens.error ? (
            <p className="py-8 text-sm text-muted" role="alert">
              {trendingTokens.error}
            </p>
          ) : null}

          {!trendingTokens.isLoading &&
          !trendingTokens.error &&
          trendingTokens.tokens.length === 0 ? (
            <p className="py-8 text-sm text-muted" role="status">
              No trending tokens right now. Ask Dilo about SOL or a memecoin.
            </p>
          ) : null}

          {!trendingTokens.isLoading && trendingTokens.tokens.length > 0 ? (
            <>
              {trendingTokens.message ? (
                <p className="mb-3 text-[0.8125rem] leading-5 text-faint">
                  {trendingTokens.message}
                  {trendingTokens.isSimulated ? ' (simulated)' : ''}
                </p>
              ) : null}
              <motion.ul {...groupEntrance} className="flex flex-col gap-2.5">
                {trendingTokens.tokens.map((token) => (
                  <TrendingTokenRow
                    key={token.symbol}
                    token={token}
                    onAsk={onAskDilo}
                  />
                ))}
              </motion.ul>
            </>
          ) : null}
        </Tabs.Content>

        <Tabs.Content value="predictions" className="focus-visible:outline-none">
          {predictionMarkets.isLoading ? (
            <p className="py-8 text-sm text-muted" role="status">
              Loading live markets…
            </p>
          ) : null}

          {!predictionMarkets.isLoading && predictionMarkets.error ? (
            <p className="py-8 text-sm text-muted" role="alert">
              {predictionMarkets.error}
            </p>
          ) : null}

          {!predictionMarkets.isLoading &&
          !predictionMarkets.error &&
          predictionMarkets.markets.length === 0 ? (
            <p className="py-8 text-sm text-muted" role="status">
              No open markets right now. Ask Dilo about a topic like bitcoin or
              the Fed.
            </p>
          ) : null}

          {!predictionMarkets.isLoading &&
          predictionMarkets.markets.length > 0 ? (
            <>
              {predictionMarkets.message ? (
                <p className="mb-3 text-[0.8125rem] leading-5 text-faint">
                  {predictionMarkets.message}
                  {predictionMarkets.isSimulated ? ' (simulated)' : ''}
                </p>
              ) : null}
              <motion.ul {...groupEntrance} className="flex flex-col gap-3">
                {predictionMarkets.markets.map((market, index) => (
                  <PredictionMarketCard
                    key={market.id}
                    market={market}
                    index={index}
                    isReducedMotion={isReducedMotion}
                    onAsk={onAskDilo}
                  />
                ))}
              </motion.ul>
            </>
          ) : null}
        </Tabs.Content>
      </Tabs.Root>
    </ScreenBody>
  )
}
