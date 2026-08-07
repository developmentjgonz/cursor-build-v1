import { useId } from 'react'

import { cn } from '../../../lib/cn'

interface GradientSquiggleProps {
  className?: string
}

export function GradientSquiggle({ className }: GradientSquiggleProps) {
  const gradientId = useId()

  return (
    <svg
      viewBox="0 0 43 14"
      aria-hidden="true"
      focusable="false"
      className={cn('h-3.5 w-[43px]', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-mint)" />
          <stop offset="50%" stopColor="var(--color-aqua)" />
          <stop offset="100%" stopColor="var(--color-magenta-neon)" />
        </linearGradient>
      </defs>
      <path
        d="M2 7c4-6 9-6 13 0s9 6 13 0 9-6 13 0"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
