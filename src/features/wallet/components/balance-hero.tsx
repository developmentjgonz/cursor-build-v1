import { motion, useReducedMotion } from 'motion/react'

import { Panel } from '../../../components/ui/panel'
import { cn } from '../../../lib/cn'
import { formatUsd } from '../../../lib/format'
import { CopyAddressButton } from './copy-address-button'

interface BalanceHeroProps {
  totalBalanceUsd: number
  address: string
  className?: string
}

const heroSpring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export function BalanceHero({
  totalBalanceUsd,
  address,
  className,
}: BalanceHeroProps) {
  const isReducedMotion = useReducedMotion() ?? false

  return (
    <Panel
      tone="brand"
      padding="lg"
      className={cn('flex flex-col items-start gap-4', className)}
    >
      {/* The figure names itself rather than carrying a caption above it. */}
      <motion.p
        initial={isReducedMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={heroSpring}
        className="max-w-full text-5xl leading-none font-extrabold tracking-[-0.03em] tabular-nums break-words text-brand"
      >
        <span className="sr-only">Total balance: </span>
        {formatUsd(totalBalanceUsd)}
      </motion.p>

      <CopyAddressButton address={address} />
    </Panel>
  )
}
