import type { ReactNode } from 'react'

import { TokenMark } from '../../../components/ui/token-mark'
import { cn } from '../../../lib/cn'

interface AssetRowProps {
  symbol: string
  name?: string
  caption?: ReactNode
  media?: ReactNode
  value: string
  trailing?: ReactNode
  className?: string
}

// A trending token in Markets and a holding in Wallet carry the same shape of
// information, so both render through this row. Sharing it keeps the mark size,
// the symbol baseline, the row padding and — most visibly — the width of the
// right-hand numeric gutter identical across the two tabs.
const numericGutter = 'w-[5.75rem]'

export function AssetRow({
  symbol,
  name,
  caption,
  media,
  value,
  trailing,
  className,
}: AssetRowProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <TokenMark symbol={symbol} />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
          <strong className="shrink-0 text-[0.9375rem] leading-tight font-bold text-ink">
            {symbol}
          </strong>
          {name ? (
            <span className="min-w-0 truncate text-[0.8125rem] leading-tight text-faint">
              {name}
            </span>
          ) : null}
        </span>

        {caption ? (
          <span className="truncate text-[0.8125rem] leading-tight tabular-nums text-muted">
            {caption}
          </span>
        ) : null}
      </span>

      {media ? (
        <span className="shrink-0" aria-hidden="true">
          {media}
        </span>
      ) : null}

      <span
        className={cn('flex shrink-0 flex-col items-end gap-1', numericGutter)}
      >
        <span className="text-[0.9375rem] leading-tight font-bold tabular-nums text-ink">
          {value}
        </span>
        {trailing}
      </span>
    </span>
  )
}

export { numericGutter }
