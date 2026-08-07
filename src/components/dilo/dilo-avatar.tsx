import { useId } from 'react'

import { cn } from '../../lib/cn'

export type DiloMood = 'idle' | 'thinking' | 'happy' | 'curious' | 'waving'

interface DiloAvatarProps {
  mood?: DiloMood
  size?: number
  label?: string
  hasGlow?: boolean
  className?: string
}

const bodyAnimationClassNames: Record<DiloMood, string> = {
  idle: 'animate-float',
  thinking: 'animate-bob',
  happy: 'animate-float',
  curious: 'animate-float',
  waving: 'animate-float',
}

export function DiloAvatar({
  mood = 'idle',
  size = 96,
  label,
  hasGlow = false,
  className,
}: DiloAvatarProps) {
  const gradientId = useId()
  const accessibleProps = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true }

  return (
    <span
      className={cn(
        'relative inline-block shrink-0 leading-none',
        hasGlow &&
          'before:absolute before:-inset-[18%] before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-violet-deep)_48%,transparent),transparent_66%)]',
        className,
      )}
      style={{ width: size, height: size }}
      {...accessibleProps}
    >
      <svg
        viewBox="0 0 120 120"
        focusable="false"
        aria-hidden="true"
        className="relative size-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="12%" y1="6%" x2="88%" y2="96%">
            <stop offset="0%" stopColor="var(--color-mint)" />
            <stop offset="46%" stopColor="var(--color-aqua)" />
            <stop offset="100%" stopColor="var(--color-violet-deep)" />
          </linearGradient>
        </defs>

        <g
          className={cn(
            'origin-bottom motion-reduce:animate-none',
            bodyAnimationClassNames[mood],
          )}
          style={{ transformBox: 'fill-box' }}
        >
          {mood === 'waving' ? (
            <path
              d="M26 62c-6-6-9-15-8-24"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="9"
              strokeLinecap="round"
              className="origin-[90%_90%] animate-wave motion-reduce:animate-none"
              style={{ transformBox: 'fill-box' }}
            />
          ) : null}

          <path
            fill={`url(#${gradientId})`}
            d="M60 12c26 0 44 20 44 46 0 17-6 30-17 38-8 6-17 8-27 8s-19-2-27-8c-11-8-17-21-17-38 0-26 18-46 44-46Z"
          />

          <ellipse
            cx="42"
            cy="42"
            rx="17"
            ry="13"
            transform="rotate(-24 42 42)"
            className="fill-white/25"
          />

          <g
            className="origin-center animate-blink motion-reduce:animate-none"
            style={{ transformBox: 'fill-box' }}
          >
            <ellipse cx="45" cy="62" rx="5" ry="7" className="fill-midnight-950" />
            <ellipse cx="75" cy="62" rx="5" ry="7" className="fill-midnight-950" />
          </g>

          {mood === 'curious' ? (
            <path
              d="M50 80h20"
              fill="none"
              strokeLinecap="round"
              strokeWidth="3.4"
              className="stroke-midnight-950"
            />
          ) : (
            <path
              d="M50 79q10 11 20 0"
              fill="none"
              strokeLinecap="round"
              strokeWidth="3.4"
              className="stroke-midnight-950"
            />
          )}
        </g>
      </svg>
    </span>
  )
}
