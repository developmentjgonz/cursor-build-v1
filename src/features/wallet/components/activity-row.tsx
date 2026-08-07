import { CircleCheck, Clock, type LucideIcon } from 'lucide-react'

import { cn } from '../../../lib/cn'
import type { ActivityEntry } from '../../../lib/mock/mock-data'

interface ActivityRowProps {
  entry: ActivityEntry
}

interface StatusPresentation {
  label: string
  Icon: LucideIcon
  className: string
}

// Status is never colour alone: each tone ships with its own icon and label.
const statusPresentation: Record<ActivityEntry['status'], StatusPresentation> = {
  confirmed: {
    label: 'Confirmed',
    Icon: CircleCheck,
    className: 'bg-up/12 text-up',
  },
  pending: {
    label: 'Pending',
    Icon: Clock,
    className: 'bg-warn/12 text-warn',
  },
}

export function ActivityRow({ entry }: ActivityRowProps) {
  const { label, Icon, className } = statusPresentation[entry.status]

  return (
    <li className="flex items-start gap-3 px-4 py-4">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[0.9375rem] leading-tight font-bold text-ink">
          {entry.summary}
        </span>
        <span className="text-[0.8125rem] leading-tight tabular-nums text-muted">
          {entry.detail}
        </span>
        <span className="mt-1 text-[0.75rem] tabular-nums text-faint">
          {entry.timestamp}
        </span>
      </span>

      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-bold',
          className,
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
        {label}
      </span>
    </li>
  )
}
