import { motion } from 'motion/react'
import { LineChart, Sparkles, Wallet, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/cn'

export type AppTab = 'ask' | 'markets' | 'wallet'

interface BottomNavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

interface TabDefinition {
  id: AppTab
  label: string
  Icon: LucideIcon
}

const tabs: readonly TabDefinition[] = [
  { id: 'ask', label: 'Ask', Icon: Sparkles },
  { id: 'markets', label: 'Markets', Icon: LineChart },
  { id: 'wallet', label: 'Wallet', Icon: Wallet },
]

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  return (
    <nav
      className="relative z-20 flex shrink-0 items-stretch gap-1 border-t border-midnight-700 bg-midnight-950/90 px-3 pt-2 pb-safe backdrop-blur-xl"
      aria-label="Primary"
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = id === activeTab

        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[0.6875rem] font-bold transition-colors',
              isActive ? 'text-ink' : 'text-midnight-400 hover:text-midnight-200',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-md bg-violet-neon/14 ring-1 ring-violet-neon/35"
                aria-hidden="true"
              />
            ) : null}
            <Icon
              className={cn('relative size-[22px]', isActive && 'text-mint')}
              strokeWidth={isActive ? 2.4 : 2}
              aria-hidden="true"
            />
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
