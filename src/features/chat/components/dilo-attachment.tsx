import {
  ArrowDown,
  Ban,
  CircleCheck,
  Clock,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import type { PredictionMarket } from '../../../../shared/contracts/prediction-market'
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
  TrendingToken,
  WalletHolding,
} from '../../../lib/mock/mock-data'
import {
  formatMarketClosesAt,
  getMarketCategory,
} from '../../../lib/prediction/market-presentation'
import type { DiloAttachment as DiloAttachmentModel } from '../chat-types'

// The six cards were written separately and drifted apart, so every shared
// text role is declared once here and reused rather than re-typed per card.
const cardTitleClass = 'text-[0.9375rem] leading-snug font-bold text-ink'
const rowTitleClass = 'text-[0.875rem] font-bold text-ink'
const rowValueClass = 'text-[0.875rem] font-bold text-ink tabular-nums'
const metaClass = 'text-[0.8125rem] leading-5 text-faint'
const listRowClass = 'flex items-center gap-3 px-4 py-3'

interface DiloAttachmentProps {
  attachment: DiloAttachmentModel
  onFollowUp: (prompt: string) => void
  onApproveTrade?: () => void
}

export function DiloAttachment({
  attachment,
  onFollowUp,
  onApproveTrade,
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
      return (
        <SwapReceiptCard
          quote={attachment.quote}
          onApproveTrade={onApproveTrade}
        />
      )
    case 'prediction':
      return (
        <PredictionReceiptCard
          quote={attachment.quote}
          onApproveTrade={onApproveTrade}
        />
      )
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
      {/* The total carries its name in an accessible label rather than a
          caption stacked on top of it. */}
      <p className="px-4 pt-4 pb-4">
        <span className="sr-only">Total wallet value: </span>
        <strong className="text-brand block text-4xl leading-none font-extrabold tracking-[-0.03em] tabular-nums">
          {formatUsd(totalUsd)}
        </strong>
      </p>

      <ul className="flex flex-col divide-y divide-midnight-700 border-t border-midnight-700">
        {holdings.map((holding) => (
          <li key={holding.symbol} className={listRowClass}>
            <TokenMark symbol={holding.symbol} size="sm" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className={cn(rowTitleClass, 'truncate')}>
                {holding.symbol}
              </span>
              <span className={cn(metaClass, 'truncate tabular-nums')}>
                {formatTokenAmount(holding.amount, holding.symbol)}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={rowValueClass}>
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
          <li key={token.symbol} className={listRowClass}>
            <TokenMark symbol={token.symbol} size="sm" />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className={cn(rowTitleClass, 'truncate')}>
                {token.symbol}
              </span>
              <span className={cn(metaClass, 'truncate')}>{token.name}</span>
            </div>

            <Sparkline
              values={token.trend}
              isPositive={token.change24hPercentage >= 0}
              width={40}
              height={22}
            />

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={rowValueClass}>
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
  markets: readonly PredictionMarket[]
  onFollowUp: (prompt: string) => void
}

function MarketsCard({ markets, onFollowUp }: MarketsCardProps) {
  return (
    <Panel tone="raised" padding="none">
      <ul className="flex flex-col divide-y divide-midnight-700">
        {markets.map((market) => (
          <li key={market.id} className="flex flex-col px-4 py-4">
            <p className={cn(rowTitleClass, 'leading-snug wrap-anywhere')}>
              {market.title}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-midnight-700 px-2 py-0.5 text-xs font-bold tracking-[0.1em] text-muted uppercase">
                {getMarketCategory(market)}
              </span>
              <span className={metaClass}>
                {formatMarketClosesAt(market.closesAt)}
              </span>
            </div>

            <ProbabilityBar
              className="mt-3"
              probability={market.yesProbability}
              label={`Chance of yes: ${market.title}`}
            />

            <div className="mt-2 flex items-center justify-between text-[0.8125rem] leading-5 font-bold tabular-nums">
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
              className="mt-3.5 text-[0.8125rem]"
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
  onApproveTrade?: () => void
}

function SwapReceiptCard({ quote, onApproveTrade }: SwapReceiptCardProps) {
  return (
    <ReceiptShell>
      <ReceiptHeadline>
        <SwapLeg
          label="You pay"
          symbol={quote.inputToken}
          amount={quote.inputAmount}
        />

        <div className="my-3 flex items-center gap-3" aria-hidden="true">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-midnight-700 text-mint">
            <ArrowDown className="size-3.5" strokeWidth={2.6} />
          </span>
          <span className="h-px flex-1 bg-midnight-700" />
        </div>

        <SwapLeg
          label="You receive"
          symbol={quote.outputToken}
          amount={quote.expectedOutputAmount}
        />
      </ReceiptHeadline>

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

      <ReceiptFooter
        expiresAt={quote.expiresAt}
        onApproveTrade={onApproveTrade}
      />
    </ReceiptShell>
  )
}

interface PredictionReceiptCardProps {
  quote: PredictionQuote
  onApproveTrade?: () => void
}

function PredictionReceiptCard({
  quote,
  onApproveTrade,
}: PredictionReceiptCardProps) {
  const isYes = quote.outcome === 'YES'

  return (
    <ReceiptShell>
      <ReceiptHeadline>
        <p className={cn(cardTitleClass, 'wrap-anywhere')}>
          {quote.marketTitle}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-[0.8125rem] leading-5 font-bold ring-1 ring-inset',
              isYes
                ? 'bg-up/15 text-up ring-up/45'
                : 'bg-down/15 text-down ring-down/45',
            )}
          >
            Buying {quote.outcome}
          </span>
          <span className={cn(metaClass, 'tabular-nums')}>
            at {formatProbability(quote.probability)}
          </span>
        </div>
      </ReceiptHeadline>

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

      <ReceiptFooter
        expiresAt={quote.expiresAt}
        onApproveTrade={onApproveTrade}
      />
    </ReceiptShell>
  )
}

function ConnectCard() {
  const [hasRequested, setHasRequested] = useState(false)

  return (
    <Panel tone="raised" className="flex flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full border border-midnight-600 bg-midnight-700 text-mint"
          aria-hidden="true"
        >
          <Wallet className="size-5" strokeWidth={2.2} />
        </span>

        <div className="flex min-w-0 flex-col gap-1">
          <strong className={cardTitleClass}>
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

// The receipt is the object the whole product turns on, so it is built as a
// sectioned document — title bar, headline amounts, fine print, actions —
// rather than a stack of boxes inside a box.
function ReceiptShell({ children }: { children: ReactNode }) {
  return (
    <Panel tone="brand" padding="none">
      <div className="flex items-center gap-2 border-b border-midnight-700 px-4 py-3">
        <ShieldCheck
          className="size-4 shrink-0 text-mint"
          strokeWidth={2.4}
          aria-hidden="true"
        />
        <p className="text-[0.8125rem] leading-5 font-bold text-ink">
          Intent receipt
        </p>
      </div>

      {children}
    </Panel>
  )
}

function ReceiptHeadline({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-midnight-700 px-4 py-4">{children}</div>
  )
}

function ReceiptFooter({
  expiresAt,
  onApproveTrade,
}: {
  expiresAt: string
  onApproveTrade?: () => void
}) {
  return (
    <div className="flex flex-col gap-3.5 px-4 py-4">
      <ExpiryLine expiresAt={expiresAt} />
      <IntentActions onApproveTrade={onApproveTrade} />
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
        <span className={metaClass}>{label}</span>
        <span className="text-lg leading-6 font-extrabold tracking-[-0.03em] text-ink tabular-nums wrap-anywhere">
          {formatTokenAmount(amount, symbol)}
        </span>
      </div>
    </div>
  )
}

interface ProbabilityBarProps {
  probability: number
  label: string
  className?: string
}

function ProbabilityBar({ probability, label, className }: ProbabilityBarProps) {
  const percentage = Math.round(probability * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-valuetext={formatProbability(probability)}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-midnight-700',
        className,
      )}
    >
      <span
        className="block h-full rounded-full bg-brand"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function FactList({ children }: { children: ReactNode }) {
  return (
    <dl className="flex flex-col divide-y divide-midnight-700 border-b border-midnight-700 px-4">
      {children}
    </dl>
  )
}

interface FactProps {
  label: string
  value: string
}

// Both sides share one line-height so every row lands on the same 40px
// baseline grid no matter how long the value is.
function Fact({ label, value }: FactProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={cn(metaClass, 'shrink-0')}>{label}</dt>
      <dd className="min-w-0 text-right text-[0.8125rem] leading-5 font-semibold text-ink tabular-nums wrap-anywhere">
        {value}
      </dd>
    </div>
  )
}

function ExpiryLine({ expiresAt }: { expiresAt: string }) {
  return (
    <p className={cn(metaClass, 'flex items-center gap-1.5')}>
      <Clock className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">
        Quote holds until {formatTime(Date.parse(expiresAt))}
      </span>
    </p>
  )
}

type IntentStatus = 'pending' | 'approved' | 'cancelled'

function IntentActions({ onApproveTrade }: { onApproveTrade?: () => void }) {
  const [status, setStatus] = useState<IntentStatus>('pending')

  // The wrapper is the live region so the outcome is announced when the
  // buttons are replaced by the status line.
  return (
    <div aria-live="polite">
      {status === 'pending' ? (
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="brand"
            size="lg"
            block
            onClick={() => {
              setStatus('approved')
              onApproveTrade?.()
            }}
          >
            Place demo trade
          </Button>
          {/* Quiet on purpose: a second full-width bordered button read as a
              rival to the primary action. */}
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStatus('cancelled')}
            className="px-4 text-[0.8125rem] font-semibold text-muted hover:bg-midnight-700 hover:text-ink"
          >
            Cancel
          </Button>
        </div>
      ) : null}

      {status === 'approved' ? (
        <StatusLine
          tone="positive"
          icon={<CircleCheck className="size-4 shrink-0" aria-hidden="true" />}
          text="Demo trade placed. Congrats — practice fill complete."
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
        'flex min-h-11 items-center gap-2 rounded-md border px-3 py-2.5 text-[0.8125rem] leading-5 font-semibold',
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

// Solana fees round to zero under the shared token formatter, so the receipt
// says "below the smallest shown amount" the same way formatUsd does for cents.
const smallestShownFeeSol = 0.0001

function formatNetworkFee(feeSol: number): string {
  if (feeSol > 0 && feeSol < smallestShownFeeSol) {
    return `<${formatTokenAmount(smallestShownFeeSol, 'SOL')}`
  }

  return formatTokenAmount(feeSol, 'SOL')
}
