import { RotateCcw } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Panel } from '../../components/ui/panel'
import { ScreenBody } from '../../components/ui/screen'
import { cn } from '../../lib/cn'
import { mockActivity } from '../../lib/mock/mock-data'
import { ActivityRow } from './components/activity-row'
import { BalanceHero } from './components/balance-hero'
import { HoldingRow } from './components/holding-row'
import { WalletEmptyState } from './components/wallet-empty-state'
import { WalletQuickActions } from './components/wallet-quick-actions'
import type { MockWallet } from './use-mock-wallet'

interface WalletViewProps {
  wallet: MockWallet
  onRestartOnboarding: () => void
}

const sectionLabel = 'text-xs font-bold tracking-[0.1em] text-faint uppercase'

export function WalletView({ wallet, onRestartOnboarding }: WalletViewProps) {
  const isConnected = wallet.status === 'connected' && wallet.address !== null

  return (
    <ScreenBody className="flex flex-col">
      {isConnected && wallet.address ? (
        <div>
          <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
            Wallet
          </h1>

          <BalanceHero
            className="mt-4"
            totalBalanceUsd={wallet.totalBalanceUsd}
            address={wallet.address}
          />

          <WalletQuickActions className="mt-4" />

          <section className="mt-7" aria-labelledby="wallet-holdings-title">
            <h2 id="wallet-holdings-title" className={cn('mb-2', sectionLabel)}>
              Holdings
            </h2>
            <Panel tone="raised" padding="none" className="overflow-hidden">
              {wallet.holdings.length > 0 ? (
                <ul className="divide-y divide-midnight-700">
                  {wallet.holdings.map((holding) => (
                    <HoldingRow key={holding.symbol} holding={holding} />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-6 text-center text-[0.8125rem] leading-relaxed text-muted">
                  No tokens yet. Add funds and your balances will show up here.
                </p>
              )}
            </Panel>
          </section>

          <section className="mt-7" aria-labelledby="wallet-activity-title">
            <h2 id="wallet-activity-title" className={cn('mb-2', sectionLabel)}>
              Recent activity
            </h2>
            <Panel tone="raised" padding="none" className="overflow-hidden">
              {mockActivity.length > 0 ? (
                <ul className="divide-y divide-midnight-700">
                  {mockActivity.map((entry) => (
                    <ActivityRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-6 text-center text-[0.8125rem] leading-relaxed text-muted">
                  Nothing here yet. Your signed transactions will appear in this
                  list.
                </p>
              )}
            </Panel>
          </section>
        </div>
      ) : (
        <WalletEmptyState
          isConnecting={wallet.status === 'connecting'}
          onConnect={wallet.connect}
        />
      )}

      <div className="mt-8 flex justify-center pb-1">
        <Button
          variant="ghost"
          size="md"
          onClick={onRestartOnboarding}
          className="text-[0.8125rem] font-bold text-faint hover:bg-midnight-800 hover:text-muted active:bg-midnight-850"
        >
          <RotateCcw className="size-4" strokeWidth={2.2} aria-hidden="true" />
          Reset onboarding
        </Button>
      </div>
    </ScreenBody>
  )
}
