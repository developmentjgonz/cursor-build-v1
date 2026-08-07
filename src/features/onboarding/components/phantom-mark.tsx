import { cn } from '../../../lib/cn'

interface PhantomMarkProps {
  className?: string
  size?: number
}

/** Simple Phantom-inspired mark for the mock connect flow. */
export function PhantomMark({ className, size = 40 }: PhantomMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect width="40" height="40" rx="12" fill="#AB9FF2" />
      <path
        d="M20 9.5c-6.2 0-11.2 4.6-11.2 10.3v7.4c0 1.1.9 2 2 2h2.4v-5.2c0-.7.6-1.3 1.3-1.3h11c.7 0 1.3.6 1.3 1.3v5.2h2.4c1.1 0 2-.9 2-2v-7.4C29.2 14.1 24.2 9.5 20 9.5Z"
        fill="#2A2145"
      />
      <circle cx="15.6" cy="19.2" r="1.7" fill="#AB9FF2" />
      <circle cx="24.4" cy="19.2" r="1.7" fill="#AB9FF2" />
    </svg>
  )
}
