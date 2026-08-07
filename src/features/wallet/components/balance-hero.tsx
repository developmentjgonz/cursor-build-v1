import { Panel } from '../../../components/ui/panel'
import { formatUsd } from '../../../lib/format'
import { CopyAddressButton } from './copy-address-button'

interface BalanceHeroProps {
  totalBalanceUsd: number
  address: string
}

export function BalanceHero({ totalBalanceUsd, address }: BalanceHeroProps) {
  return (
    <Panel tone="brand" padding="lg" className="flex flex-col gap-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-faint">
        Total balance
      </h2>

      <p className="text-5xl font-extrabold tracking-[-0.04em] tabular-nums text-brand">
        {formatUsd(totalBalanceUsd)}
      </p>

      <CopyAddressButton address={address} />
    </Panel>
  )
}
