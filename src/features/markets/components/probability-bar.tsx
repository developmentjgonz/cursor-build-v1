import { motion } from 'motion/react'

import { formatProbability } from '../../../lib/format'
import { listSpring } from './stagger'

interface ProbabilityBarProps {
  yesProbability: number
  label: string
  delaySeconds: number
  isReducedMotion: boolean
}

export function ProbabilityBar({
  yesProbability,
  label,
  delaySeconds,
  isReducedMotion,
}: ProbabilityBarProps) {
  const yesPercentage = Math.round(yesProbability * 100)
  const targetWidth = `${yesPercentage}%`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-[0.8125rem]">
        <span className="text-muted">
          Yes{' '}
          <span className="font-bold tabular-nums text-mint">
            {formatProbability(yesProbability)}
          </span>
        </span>
        <span className="text-muted">
          No{' '}
          <span className="font-bold tabular-nums text-ink">
            {formatProbability(1 - yesProbability)}
          </span>
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={yesPercentage}
        aria-valuetext={`${formatProbability(yesProbability)} yes`}
        className="h-2 overflow-hidden rounded-full bg-midnight-700"
      >
        <motion.div
          initial={{ width: isReducedMotion ? targetWidth : 0 }}
          animate={{ width: targetWidth }}
          transition={{ ...listSpring, delay: delaySeconds }}
          className="h-full rounded-full bg-gradient-to-r from-mint to-aqua"
        />
      </div>
    </div>
  )
}
