import { DollarSign } from 'lucide-react'
import { useId } from 'react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { cn } from '../../../lib/cn'

interface DepositHeroProps {
  className?: string
}

// Dilo peeking out of an open wallet: the mascot sits behind the wallet body so
// the wallet reads as the container, and the coin overlaps both to sell depth.
export function DepositHero({ className }: DepositHeroProps) {
  const markGradientId = useId()

  return (
    <div
      className={cn('relative mx-auto h-[188px] w-[236px]', className)}
      role="img"
      aria-label="Dilo peeking out of a wallet holding a dollar coin"
    >
      <DiloAvatar
        size={112}
        mood="happy"
        hasGlow
        className="absolute left-1/2 top-1 -translate-x-1/2"
      />

      <svg
        viewBox="0 0 236 108"
        focusable="false"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-3 w-full"
      >
        <defs>
          <linearGradient id={markGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-mint)" />
            <stop offset="55%" stopColor="var(--color-aqua)" />
            <stop offset="100%" stopColor="var(--color-magenta-neon)" />
          </linearGradient>
        </defs>

        <path
          d="M30 22h176a12 12 0 0 1 12 12v6H18v-6a12 12 0 0 1 12-12Z"
          className="fill-midnight-700"
        />
        <rect
          x="18"
          y="34"
          width="200"
          height="66"
          rx="16"
          className="fill-midnight-800 stroke-midnight-600"
          strokeWidth="2"
        />
        <rect
          x="156"
          y="52"
          width="46"
          height="32"
          rx="9"
          className="fill-midnight-850 stroke-midnight-600"
          strokeWidth="1.5"
        />
        <g
          fill="none"
          stroke={`url(#${markGradientId})`}
          strokeWidth="3.4"
          strokeLinecap="round"
          transform="translate(17 0) skewX(-14)"
        >
          <path d="M164 62h18" />
          <path d="M164 68.5h18" />
          <path d="M164 75h18" />
        </g>

        <path
          d="M52 6 55 14 63 17 55 20 52 28 49 20 41 17 49 14Z"
          className="fill-mint"
        />
        <path
          d="M206 10 208 15 213 17 208 19 206 24 204 19 199 17 204 15Z"
          className="fill-violet-neon"
        />
        <circle cx="224" cy="46" r="2.6" className="fill-aqua" />
        <circle cx="12" cy="58" r="2.2" className="fill-magenta-neon" />
      </svg>

      <span className="absolute bottom-[42px] left-2 grid size-[58px] place-items-center rounded-full bg-brand p-[3px]">
        <span className="grid size-full place-items-center rounded-full bg-midnight-850">
          <DollarSign className="size-7 text-mint" strokeWidth={2.6} />
        </span>
      </span>
    </div>
  )
}
