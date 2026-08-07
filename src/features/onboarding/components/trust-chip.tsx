import type { LucideIcon } from 'lucide-react'

import { cn } from '../../../lib/cn'

interface TrustChipProps {
  Icon: LucideIcon
  label: string
  className?: string
}

export function TrustChip({ Icon, label, className }: TrustChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-midnight-700 bg-midnight-850 px-3 py-1.5 text-[0.8125rem] font-bold text-muted',
        className,
      )}
    >
      <Icon className="size-4 shrink-0 text-mint" strokeWidth={2.2} aria-hidden="true" />
      {label}
    </span>
  )
}
