import {
  ArrowDownToLine,
  ArrowLeftRight,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { useId } from 'react'

import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'

interface QuickActionsProps {
  className?: string
}

interface QuickAction {
  id: string
  label: string
  Icon: LucideIcon
}

const quickActions: readonly QuickAction[] = [
  { id: 'add-funds', label: 'Add funds', Icon: ArrowDownToLine },
  { id: 'send', label: 'Send', Icon: Send },
  { id: 'swap', label: 'Swap', Icon: ArrowLeftRight },
]

export function WalletQuickActions({ className }: QuickActionsProps) {
  const captionId = useId()

  return (
    <div className={cn(className)}>
      {/* Unavailability is carried by the caption below, not by a dimmed
          label, so the state survives without colour. */}
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant="subtle"
            size="md"
            disabled
            aria-describedby={captionId}
            className="min-h-16 flex-col gap-1.5 px-2 text-[0.75rem] disabled:border-midnight-700 disabled:bg-midnight-900 disabled:text-faint"
          >
            <Icon className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
            {label}
            <span className="sr-only">, coming soon</span>
          </Button>
        ))}
      </div>

      <p
        id={captionId}
        className="mt-2.5 text-center text-[0.75rem] leading-relaxed text-faint"
      >
        These shortcuts are coming soon. Ask Dilo in chat to move funds today.
      </p>
    </div>
  )
}
