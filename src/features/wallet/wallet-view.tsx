import { RotateCcw } from 'lucide-react'
import { useReducedMotion } from 'motion/react'

import { Button } from '../../components/ui/button'
import { Panel } from '../../components/ui/panel'
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

export function WalletView({ wallet, onRestartOnboarding }: WalletViewProps) {
  const isReducedMotion = useReducedMotion() ?? false
  const isConnected = wallet.status === 'connected' && wallet.address !== null

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-4 scrollbar-none">
      {isConnected && wallet.address ? (
        <div className="flex flex-col gap-5">
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em] text-ink">
            Wallet
          </h1>

          <BalanceHero
            totalBalanceUsd={wallet.totalBalanceUsd}
            address={wallet.address}
          />

          <WalletQuickActions />

          <section aria-labelledby="wallet-holdings-title">
            <h2
              id="wallet-holdings-title"
              className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-faint"
            >
              Holdings
            </h2>
            <Panel tone="raised" padding="none">
              <ul className="divide-y divide-midnight-700">
                {wallet.holdings.map((holding, index) => (
                  <HoldingRow
                    key={holding.symbol}
                    holding={holding}
                    index={index}
                    isReducedMotion={isReducedMotion}
                  />
                ))}
              </ul>
            </Panel>
          </section>

          <section aria-labelledby="wallet-activity-title">
            <h2
              id="wallet-activity-title"
              className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-faint"
            >
              Recent activity
            </h2>
            <Panel tone="raised" padding="none">
              <ul className="divide-y divide-midnight-700">
                {mockActivity.map((entry, index) => (
                  <ActivityRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    isReducedMotion={isReducedMotion}
                  />
                ))}
              </ul>
            </Panel>
          </section>
        </div>
      ) : (
        <WalletEmptyState
          isConnecting={wallet.status === 'connecting'}
          onConnect={wallet.connect}
        />
      )}

      <div className="mt-6 flex justify-center">
        <Button
          variant="ghost"
          size="md"
          onClick={onRestartOnboarding}
          className="text-[0.8125rem] font-semibold text-faint hover:bg-midnight-800 hover:text-muted"
        >
          <RotateCcw className="size-4" strokeWidth={2.2} aria-hidden="true" />
          Reset onboarding
        </Button>
      </div>
    </div>
  )
}
