import { motion } from 'motion/react'

import { DiloAvatar } from '../dilo/dilo-avatar'
import { DiloWordmark } from '../brand/dilo-wordmark'
import { cn } from '../../lib/cn'
import type { MockWallet } from '../../features/wallet/use-mock-wallet'

interface AppHeaderProps {
  wallet: MockWallet
}

const walletLabels: Record<MockWallet['status'], string> = {
  disconnected: 'Connect',
  connecting: 'Connecting',
  connected: 'Connected',
}

export function AppHeader({ wallet }: AppHeaderProps) {
  const isConnected = wallet.status === 'connected'
  const shortAddress =
    isConnected && wallet.address
      ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
      : walletLabels[wallet.status]

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 pt-safe pb-3">
      <span className="flex items-center gap-2">
        <DiloAvatar mood="idle" size={30} />
        <DiloWordmark size="sm" />
      </span>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={isConnected ? wallet.disconnect : wallet.connect}
        disabled={wallet.status === 'connecting'}
        className="flex min-h-9 items-center gap-2 rounded-full border border-midnight-600 bg-midnight-800 px-3.5 text-[0.8125rem] font-bold text-ink transition-colors hover:border-aqua disabled:opacity-70"
      >
        <span
          className={cn(
            'size-2 rounded-full',
            isConnected ? 'bg-up shadow-glow-mint' : 'bg-midnight-400',
            wallet.status === 'connecting' && 'animate-pulse bg-warn',
          )}
          aria-hidden="true"
        />
        {shortAddress}
      </motion.button>
    </header>
  )
}
