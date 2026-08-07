import {
  ArrowDownToLine,
  ArrowLeftRight,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { useId } from 'react'

import { Button } from '../../../components/ui/button'

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

export function WalletQuickActions() {
  const captionId = useId()

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant="subtle"
            size="md"
            disabled
            aria-describedby={captionId}
            className="min-h-16 flex-col gap-1.5 px-2 text-[0.75rem] disabled:text-midnight-400"
          >
            <Icon className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
            {label}
            <span className="sr-only">, coming soon</span>
          </Button>
        ))}
      </div>

      <p id={captionId} className="mt-2 text-center text-[0.75rem] text-faint">
        These shortcuts are coming soon. Ask Dilo in chat to move funds today.
      </p>
    </div>
  )
}
