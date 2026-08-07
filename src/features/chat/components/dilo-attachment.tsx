import {
  ArrowDown,
  Ban,
  CircleCheck,
  Clock,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'

import type {
  PredictionQuote,
  SwapQuote,
} from '../../../../shared/contracts/quote'
import { Button } from '../../../components/ui/button'
import { ChangeBadge } from '../../../components/ui/change-badge'
import { Panel } from '../../../components/ui/panel'
import { Sparkline } from '../../../components/ui/sparkline'
import { TokenMark } from '../../../components/ui/token-mark'
import { cn } from '../../../lib/cn'
import {
  formatPrice,
  formatProbability,
  formatSignedPercentage,
  formatTime,
  formatTokenAmount,
  formatUsd,
} from '../../../lib/format'
import type {
  PredictionMarketSummary,
  TrendingToken,
  WalletHolding,
} from '../../../lib/mock/mock-data'
import type { DiloAttachment as DiloAttachmentModel } from '../chat-types'

interface DiloAttachmentProps {
  attachment: DiloAttachmentModel
  onFollowUp: (prompt: string) => void
}

export function DiloAttachment({
  attachment,
  onFollowUp,
}: DiloAttachmentProps) {
  switch (attachment.kind) {
    case 'balance':
      return (
        <BalanceCard
          totalUsd={attachment.totalUsd}
          holdings={attachment.holdings}
        />
      )
    case 'tokens':
      return <TokensCard tokens={attachment.tokens} />
    case 'markets':
      return (
        <MarketsCard markets={attachment.markets} onFollowUp={onFollowUp} />
      )
    case 'swap':
      return <SwapReceiptCard quote={attachment.quote} />
    case 'prediction':
      return <PredictionReceiptCard quote={attachment.quote} />
    case 'connect':
      return <ConnectCard />
  }
}

interface BalanceCardProps {
  totalUsd: number
  holdings: readonly WalletHolding[]
}

function BalanceCard({ totalUsd, holdings }: BalanceCardProps) {
  return (
    <Panel tone="raised" padding="none">
      <div className="flex flex-col gap-0.5 px-4 pt-4 pb-3">
        <SectionLabel>Total value</SectionLabel>
        <strong className="text-brand text-4xl font-extrabold tracking-[-0.04em] tabular-nums">
          {formatUsd(totalUsd)}
        </strong>
      </div>

      <ul className="flex flex-col divide-y divide-midnight-700 border-t border-midnight-700">
        {holdings.map((holding) => (
          <li key={holding.symbol} className="flex items-center gap-3 px-4 py-3">
            <TokenMark symbol={holding.symbol} size="sm" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[0.875rem] font-bold text-ink">
                {holding.symbol}
              </span>
              <span className="truncate text-[0.75rem] text-faint tabular-nums">
                {formatTokenAmount(holding.amount, holding.symbol)}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[0.875rem] font-bold text-ink tabular-nums">
                {formatUsd(holding.valueUsd)}
              </span>
              <ChangeBadge value={holding.change24hPercentage} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

interface TokensCardProps {
  tokens: readonly TrendingToken[]
}

function TokensCard({ tokens }: TokensCardProps) {
  return (
    <Panel tone="raised" padding="none">
      <ul className="flex flex-col divide-y divide-midnight-700">
        {tokens.map((token) => (
          <li
            key={token.symbol}
            className="flex items-center gap-2.5 px-3.5 py-3"
          >
            <TokenMark symbol={token.symbol} size="sm" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[0.875rem] font-bold text-ink">
                {token.symbol}
              </span>
              <span className="truncate text-[0.75rem] text-faint">
                {token.name}
              </span>
            </div>

            <Sparkline
              values={token.trend}
              isPositive={token.change24hPercentage >= 0}
              width={44}
              height={22}
            />

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[0.8125rem] font-bold text-ink tabular-nums">
                {formatPrice(token.priceUsd)}
              </span>
              <ChangeBadge value={token.change24hPercentage} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

interface MarketsCardProps {
  markets: readonly PredictionMarketSummary[]
  onFollowUp: (prompt: string) => void
}

function MarketsCard({ markets, onFollowUp }: MarketsCardProps) {
  return (
    <Panel tone="raised" padding="none">
      <ul className="flex flex-col divide-y divide-midnight-700">
        {markets.map((market) => (
          <li key={market.id} className="flex flex-col gap-2.5 px-4 py-3.5">
            <p className="text-[0.875rem] leading-snug font-bold text-ink">
              {market.title}
            </p>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-midnight-700 px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.08em] text-muted uppercase">
                {market.category}
              </span>
              <span className="text-[0.75rem] text-faint">
                {market.closesAt}
              </span>
            </div>

            <ProbabilityBar
              probability={market.yesProbability}
              label={`Chance of yes: ${market.title}`}
            />

            <div className="flex items-center justify-between text-[0.8125rem] font-bold tabular-nums">
              <span className="text-mint">
                Yes {formatProbability(market.yesProbability)}
              </span>
              <span className="text-muted">
                No {formatProbability(1 - market.yesProbability)}
              </span>
            </div>

            <Button
              variant="subtle"
              size="md"
              block
              className="text-[0.8125rem]"
              onClick={() => onFollowUp(`Put $2 on YES for ${market.title}`)}
            >
              Price $2 on Yes
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

interface SwapReceiptCardProps {
  quote: SwapQuote
}

function SwapReceiptCard({ quote }: SwapReceiptCardProps) {
  return (
    <Panel tone="brand" padding="none">
      <div className="flex flex-col gap-4 p-4">
        <ReceiptHeader />

        <div className="flex flex-col gap-2">
          <SwapLeg
            label="You pay"
            symbol={quote.inputToken}
            amount={quote.inputAmount}
          />

          <div className="flex items-center gap-3 pl-2" aria-hidden="true">
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-midnight-600 bg-midnight-900 text-mint">
              <ArrowDown className="size-3.5" strokeWidth={2.6} />
            </span>
            <span className="h-px flex-1 bg-midnight-700" />
          </div>

          <SwapLeg
            label="You receive"
            symbol={quote.outputToken}
            amount={quote.expectedOutputAmount}
          />
        </div>

        <FactList>
          <Fact
            label="Minimum received"
            value={formatTokenAmount(
              quote.minimumOutputAmount,
              quote.outputToken,
            )}
          />
          <Fact
            label="Price impact"
            value={formatSignedPercentage(-quote.priceImpactPercentage)}
          />
          <Fact label="Route" value={quote.route.join(' · ')} />
          <Fact
            label="Network fee"
            value={formatNetworkFee(quote.estimatedFeeSol)}
          />
        </FactList>

        <ExpiryLine expiresAt={quote.expiresAt} />
        <IntentFooter />
      </div>
    </Panel>
  )
}

interface PredictionReceiptCardProps {
  quote: PredictionQuote
}

function PredictionReceiptCard({ quote }: PredictionReceiptCardProps) {
  const isYes = quote.outcome === 'YES'

  return (
    <Panel tone="brand" padding="none">
      <div className="flex flex-col gap-4 p-4">
        <ReceiptHeader />

        <div className="flex flex-col gap-2.5">
          <p className="text-[0.9375rem] leading-snug font-bold text-ink">
            {quote.marketTitle}
          </p>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-[0.8125rem] font-extrabold tracking-[0.06em] ring-1 ring-inset',
                isYes
                  ? 'bg-up/15 text-up ring-up/45'
                  : 'bg-down/15 text-down ring-down/45',
              )}
            >
              Buying {quote.outcome}
            </span>
            <span className="text-[0.8125rem] text-faint tabular-nums">
              at {formatProbability(quote.probability)}
            </span>
          </div>
        </div>

        <FactList>
          <Fact label="You pay" value={formatUsd(quote.costUsd)} />
          <Fact
            label="Pays out if correct"
            value={formatUsd(quote.potentialPayoutUsd)}
          />
          <Fact
            label="Chance priced in"
            value={formatProbability(quote.probability)}
          />
          <Fact
            label="Network fee"
            value={formatNetworkFee(quote.estimatedFeeSol)}
          />
        </FactList>

        <ExpiryLine expiresAt={quote.expiresAt} />
        <IntentFooter />
      </div>
    </Panel>
  )
}

function ConnectCard() {
  const [hasRequested, setHasRequested] = useState(false)

  return (
    <Panel tone="raised" className="flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full border border-midnight-600 bg-midnight-700 text-mint"
          aria-hidden="true"
        >
          <Wallet className="size-5" strokeWidth={2.2} />
        </span>

        <div className="flex min-w-0 flex-col gap-1">
          <strong className="text-[0.9375rem] font-bold text-ink">
            Connect a wallet to add funds
          </strong>
          <span className="text-[0.8125rem] leading-relaxed text-muted">
            Send SOL or USDC from a wallet you already use, or add USD with a
            card and Dilo converts it for you.
          </span>
        </div>
      </div>

      <div aria-live="polite">
        {hasRequested ? (
          <StatusLine
            tone="positive"
            icon={<CircleCheck className="size-4 shrink-0" aria-hidden="true" />}
            text="Request sent. Approve the connection in your wallet app."
          />
        ) : (
          <Button
            variant="brand"
            size="lg"
            block
            onClick={() => setHasRequested(true)}
          >
            Connect wallet
          </Button>
        )}
      </div>
    </Panel>
  )
}

function ReceiptHeader() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck
        className="size-4 shrink-0 text-mint"
        strokeWidth={2.4}
        aria-hidden="true"
      />
      <SectionLabel>Intent receipt</SectionLabel>
    </div>
  )
}

interface SwapLegProps {
  label: string
  symbol: string
  amount: number
}

function SwapLeg({ label, symbol, amount }: SwapLegProps) {
  return (
    <div className="flex items-center gap-3">
      <TokenMark symbol={symbol} size="sm" />

      <div className="flex min-w-0 flex-1 flex-col">
        <SectionLabel>{label}</SectionLabel>
        <span className="truncate text-lg font-extrabold tracking-[-0.03em] text-ink tabular-nums">
          {formatTokenAmount(amount, symbol)}
        </span>
      </div>
    </div>
  )
}

interface ProbabilityBarProps {
  probability: number
  label: string
}

function ProbabilityBar({ probability, label }: ProbabilityBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const percentage = Math.round(probability * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-valuetext={formatProbability(probability)}
      className="h-2 w-full overflow-hidden rounded-full bg-midnight-700"
    >
      <motion.span
        className="block h-full rounded-full bg-brand"
        initial={{ width: prefersReducedMotion ? `${percentage}%` : 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      />
    </div>
  )
}

function FactList({ children }: { children: ReactNode }) {
  return (
    <dl className="flex flex-col divide-y divide-midnight-700 rounded-md border border-midnight-700 bg-midnight-900/60 px-3">
      {children}
    </dl>
  )
}

interface FactProps {
  label: string
  value: string
}

function Fact({ label, value }: FactProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[0.8125rem] text-faint">{label}</dt>
      <dd className="truncate text-[0.8125rem] font-semibold text-ink tabular-nums">
        {value}
      </dd>
    </div>
  )
}

function ExpiryLine({ expiresAt }: { expiresAt: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[0.8125rem] text-faint">
      <Clock className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">
        Quote holds until {formatTime(Date.parse(expiresAt))}
      </span>
    </p>
  )
}

type IntentStatus = 'pending' | 'approved' | 'cancelled'

function IntentFooter() {
  const [status, setStatus] = useState<IntentStatus>('pending')

  // The wrapper is the live region so the outcome is announced when the
  // buttons are replaced by the status line.
  return (
    <div aria-live="polite" className="flex flex-col gap-2">
      {status === 'pending' ? (
        <>
          <Button
            variant="brand"
            size="lg"
            block
            onClick={() => setStatus('approved')}
          >
            Approve and sign
          </Button>
          <Button
            variant="subtle"
            size="md"
            block
            onClick={() => setStatus('cancelled')}
          >
            Cancel
          </Button>
        </>
      ) : null}

      {status === 'approved' ? (
        <StatusLine
          tone="positive"
          icon={<CircleCheck className="size-4 shrink-0" aria-hidden="true" />}
          text="Approved. Sent to your wallet to sign."
        />
      ) : null}

      {status === 'cancelled' ? (
        <StatusLine
          tone="neutral"
          icon={<Ban className="size-4 shrink-0" aria-hidden="true" />}
          text="Cancelled. Nothing was signed and nothing moved."
        />
      ) : null}
    </div>
  )
}

interface StatusLineProps {
  tone: 'positive' | 'neutral'
  icon: ReactNode
  text: string
}

function StatusLine({ tone, icon, text }: StatusLineProps) {
  return (
    <p
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-md border px-3 py-2.5 text-[0.8125rem] font-semibold',
        tone === 'positive'
          ? 'border-up/40 bg-up/10 text-up'
          : 'border-midnight-600 bg-midnight-900 text-muted',
      )}
    >
      {icon}
      {text}
    </p>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-bold tracking-[0.12em] text-faint uppercase">
      {children}
    </span>
  )
}

// Solana fees round to zero under the shared token formatter, so the receipt
// says "below the smallest shown amount" the same way formatUsd does for cents.
const smallestShownFeeSol = 0.0001

function formatNetworkFee(feeSol: number): string {
  if (feeSol > 0 && feeSol < smallestShownFeeSol) {
    return `<${formatTokenAmount(smallestShownFeeSol, 'SOL')}`
  }

  return formatTokenAmount(feeSol, 'SOL')
}
