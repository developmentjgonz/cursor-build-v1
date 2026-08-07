import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/cn'

// On a dark surface a hairline border reads as elevation more reliably than a
// shadow, so each tone declares one or the other and never both.
const panelVariants = cva('rounded-lg', {
  variants: {
    tone: {
      default: 'border border-midnight-600 bg-midnight-800',
      raised: 'border border-midnight-500 bg-midnight-850',
      selected: 'border border-mint bg-midnight-800 shadow-glow-mint',
      brand: 'border-brand',
      quiet: 'border border-midnight-700 bg-midnight-900',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    tone: 'default',
    padding: 'md',
  },
})

interface PanelProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof panelVariants> {}

export function Panel({ className, tone, padding, ...props }: PanelProps) {
  return (
    <div className={cn(panelVariants({ tone, padding }), className)} {...props} />
  )
}

interface InfoCardProps {
  icon: ReactNode
  title: string
  body: string
  trailing?: ReactNode
  className?: string
}

export function InfoCard({
  icon,
  title,
  body,
  trailing,
  className,
}: InfoCardProps) {
  return (
    <Panel
      className={cn('flex items-start gap-3.5', className)}
      tone="raised"
      padding="md"
    >
      <span
        className="grid size-11 shrink-0 place-items-center rounded-full border border-midnight-600 bg-midnight-700 text-mint"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <strong className="text-[0.9375rem] font-bold text-ink">{title}</strong>
        <span className="text-[0.8125rem] leading-relaxed text-muted">
          {body}
        </span>
      </span>
      {trailing ? (
        <span className="shrink-0 self-center text-violet-neon" aria-hidden="true">
          {trailing}
        </span>
      ) : null}
    </Panel>
  )
}

export { panelVariants }
