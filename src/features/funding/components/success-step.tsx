import { motion, useReducedMotion } from 'motion/react'
import { Check, Wallet } from 'lucide-react'

import { InfoCard } from '../../../components/ui/panel'
import { formatUsd } from '../../../lib/format'

interface SuccessStepProps {
  netUsd: number
}

interface ConfettiPiece {
  x: number
  y: number
  rotate: number
  shape: 'rect' | 'circle' | 'bar'
  className: string
}

// Hand-placed so the burst reads as a ring around the emblem rather than a
// random scatter; the emblem itself occupies roughly a 60px radius.
const confettiPieces: readonly ConfettiPiece[] = [
  { x: -96, y: -46, rotate: -28, shape: 'rect', className: 'fill-violet-neon' },
  { x: -72, y: 22, rotate: 34, shape: 'rect', className: 'fill-violet-neon' },
  { x: 88, y: -28, rotate: 18, shape: 'rect', className: 'fill-mint' },
  { x: 74, y: 34, rotate: -22, shape: 'rect', className: 'fill-magenta-neon' },
  { x: -30, y: -84, rotate: -12, shape: 'bar', className: 'fill-aqua' },
  { x: 36, y: -78, rotate: 26, shape: 'bar', className: 'fill-mint' },
  { x: -104, y: -6, rotate: 0, shape: 'circle', className: 'fill-aqua' },
  { x: 102, y: 6, rotate: 0, shape: 'circle', className: 'fill-mint' },
  { x: -58, y: -70, rotate: 0, shape: 'circle', className: 'fill-magenta-neon' },
  { x: 62, y: -60, rotate: 0, shape: 'circle', className: 'fill-violet-neon' },
  { x: -18, y: 62, rotate: 0, shape: 'circle', className: 'fill-aqua' },
  { x: 24, y: 68, rotate: 14, shape: 'rect', className: 'fill-mint' },
  { x: -86, y: 52, rotate: -40, shape: 'bar', className: 'fill-magenta-neon' },
  { x: 92, y: 56, rotate: 40, shape: 'bar', className: 'fill-violet-neon' },
]

export function SuccessStep({ netUsd }: SuccessStepProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex min-h-full flex-col gap-7 pt-4 pb-2">
      <div className="relative flex justify-center py-4">
        {shouldReduceMotion ? null : (
          <svg
            viewBox="-130 -130 260 260"
            className="pointer-events-none absolute inset-0 size-full"
            focusable="false"
            aria-hidden="true"
          >
            {confettiPieces.map((piece, index) => (
              <motion.g
                key={`${piece.x}-${piece.y}`}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: 1, x: piece.x, y: piece.y, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 20,
                  delay: 0.12 + index * 0.022,
                }}
              >
                <g transform={`rotate(${piece.rotate})`}>
                  {piece.shape === 'circle' ? (
                    <circle r="4" className={piece.className} />
                  ) : null}
                  {piece.shape === 'rect' ? (
                    <rect
                      x="-6"
                      y="-4"
                      width="12"
                      height="8"
                      rx="2"
                      className={piece.className}
                    />
                  ) : null}
                  {piece.shape === 'bar' ? (
                    <rect
                      x="-2"
                      y="-9"
                      width="4"
                      height="18"
                      rx="2"
                      className={piece.className}
                    />
                  ) : null}
                </g>
              </motion.g>
            ))}
          </svg>
        )}

        <span className="relative grid size-32 place-items-center rounded-full bg-brand p-[3px] shadow-glow-mint">
          <span className="grid size-full place-items-center rounded-full bg-midnight-900">
            <Check
              className="size-14 text-mint"
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em]">
          Deposit successful!
        </h1>
        <p className="flex items-baseline justify-center gap-2">
          <span className="text-brand text-5xl font-extrabold tracking-[-0.03em] tabular-nums">
            {formatUsd(netUsd)}
          </span>
          <span className="text-xl font-extrabold text-violet-neon">USD</span>
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          added to your wallet
        </p>
      </div>

      <InfoCard
        icon={<Wallet className="size-5" strokeWidth={2.2} />}
        title="You're all set!"
        body="Your funds are ready and you can start using Dilo right away."
      />

      <p className="sr-only" role="status" aria-live="polite">
        Deposit successful. {formatUsd(netUsd)} added to your wallet.
      </p>
    </div>
  )
}
