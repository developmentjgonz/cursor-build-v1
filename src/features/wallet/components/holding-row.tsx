import { Minus } from 'lucide-react'

import { ChangeBadge } from '../../../components/ui/change-badge'
import { formatTokenAmount, formatUsd } from '../../../lib/format'
import type { WalletHolding } from '../../../lib/mock/mock-data'
import { AssetRow } from '../../markets/components/asset-row'

interface HoldingRowProps {
  holding: WalletHolding
}

export function HoldingRow({ holding }: HoldingRowProps) {
  return (
    <li className="px-4 py-4">
      <AssetRow
        symbol={holding.symbol}
        name={holding.name}
        caption={formatTokenAmount(holding.amount, holding.symbol)}
        value={formatUsd(holding.valueUsd)}
        trailing={
          holding.change24hPercentage === 0 ? (
            <FlatBadge />
          ) : (
            <ChangeBadge value={holding.change24hPercentage} />
          )
        }
      />
    </li>
  )
}

// Matches ChangeBadge's geometry, icon included, so a flat holding does not sit
// a couple of pixels shorter than its neighbours in the same column.
function FlatBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-midnight-700 px-2 py-0.5 text-[0.75rem] font-bold text-muted">
      <Minus className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
      Flat
      <span className="sr-only"> over the last 24 hours</span>
    </span>
  )
}
