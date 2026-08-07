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
      className={cn(
        'relative z-20 flex shrink-0 items-stretch gap-1 bg-midnight-950 px-2 pt-2',
        '[padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]',
        // A scrim instead of a rule: the composer above already draws a
        // hairline, and two lines this close read as a ladder.
        'before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-midnight-950 before:to-transparent',
      )}
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
            className="group flex flex-1 flex-col items-center gap-1 rounded-sm pt-1 pb-0.5 focus-visible:outline-none"
          >
            {/* Focus + active both live on the icon pill so the global
                aqua outline never wraps the whole flex-1 cell. */}
            <span
              className={cn(
                'relative grid h-8 w-14 place-items-center rounded-full transition-[box-shadow]',
                'group-focus-visible:shadow-[0_0_0_2px_var(--color-midnight-950),0_0_0_4px_var(--color-aqua)]',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="tab-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-mint/14"
                  aria-hidden="true"
                />
              ) : null}
              <Icon
                className={cn(
                  'relative size-[21px] transition-colors',
                  isActive
                    ? 'text-mint'
                    : 'text-faint group-hover:text-muted',
                )}
                strokeWidth={isActive ? 2.4 : 2}
                aria-hidden="true"
              />
            </span>

            <span
              className={cn(
                'text-[0.6875rem] leading-none font-bold transition-colors',
                isActive ? 'text-ink' : 'text-faint group-hover:text-muted',
              )}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
