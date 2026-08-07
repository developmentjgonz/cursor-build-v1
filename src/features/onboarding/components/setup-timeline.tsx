import { ShieldCheck, UserPlus, Wallet, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useId } from 'react'

import { cn } from '../../../lib/cn'

interface SetupTimelineProps {
  className?: string
}

interface SetupStep {
  readonly id: string
  readonly name: string
  readonly caption: string
  readonly Icon: LucideIcon
  readonly markerClassName: string
  readonly tileClassName: string
  readonly nameClassName: string
}

const setupSteps: readonly SetupStep[] = [
  {
    id: 'create',
    name: 'Create',
    caption: 'Your Solana wallet is ready',
    Icon: UserPlus,
    markerClassName: 'border-mint/70 text-mint',
    tileClassName: 'border-mint/30 bg-mint/10 text-mint',
    nameClassName: 'text-mint',
  },
  {
    id: 'secure',
    name: 'Secure',
    caption: 'We keep your wallet safe',
    Icon: ShieldCheck,
    markerClassName: 'border-aqua/70 text-aqua',
    tileClassName: 'border-aqua/30 bg-aqua/10 text-aqua',
    nameClassName: 'text-aqua',
  },
  {
    id: 'fund',
    name: 'Fund',
    caption: 'Add money with USD, simply',
    Icon: Wallet,
    markerClassName: 'border-violet-neon/70 text-violet-neon',
    tileClassName: 'border-violet-neon/30 bg-violet-neon/10 text-violet-neon',
    nameClassName: 'text-violet-neon',
  },
]

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.05 } },
}

const connectorVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
}

const markerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
}

export function SetupTimeline({ className }: SetupTimelineProps) {
  const shouldReduceMotion = useReducedMotion()
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2
        id={headingId}
        className="text-center text-[0.9375rem] font-bold text-ink"
      >
        Here&rsquo;s how it works
      </h2>

      {/* The connector draws itself once as the markers land; the tiles and
          captions below are already at rest. */}
      <motion.div
        variants={groupVariants}
        initial={shouldReduceMotion ? false : 'hidden'}
        animate="visible"
        className="relative mt-5"
      >
        <motion.span
          variants={connectorVariants}
          aria-hidden="true"
          className="absolute top-[15px] right-[16.667%] left-[16.667%] origin-left border-t border-dashed border-midnight-600"
        />

        <ol className="relative grid grid-cols-3 gap-x-2">
          {setupSteps.map((step, index) => (
            <li key={step.id} className="flex flex-col items-center text-center">
              <motion.span
                variants={markerVariants}
                className={cn(
                  'grid size-[30px] place-items-center rounded-full border bg-midnight-900 text-[0.75rem] font-bold tabular-nums',
                  step.markerClassName,
                )}
              >
                {index + 1}
              </motion.span>

              <span
                aria-hidden="true"
                className={cn(
                  'mt-3.5 grid size-12 place-items-center rounded-md border',
                  step.tileClassName,
                )}
              >
                <step.Icon className="size-[22px]" />
              </span>

              <span
                className={cn(
                  'mt-2.5 text-[0.8125rem] font-bold',
                  step.nameClassName,
                )}
              >
                {step.name}
              </span>
              <span className="mt-1 text-[0.75rem] leading-snug text-faint">
                {step.caption}
              </span>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  )
}
