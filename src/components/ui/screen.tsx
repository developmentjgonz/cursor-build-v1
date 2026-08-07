import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

interface ScreenProps {
  children: ReactNode
  className?: string
}

interface ScreenSlotProps {
  children: ReactNode
  className?: string
}

const screenTransition = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 34,
}

export function Screen({ children, className }: ScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={screenTransition}
      className={cn(
        'relative flex h-svh w-full flex-col overflow-hidden bg-midnight-900',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[46%] before:bg-[radial-gradient(110%_100%_at_50%_0%,color-mix(in_oklab,var(--color-violet-neon)_20%,transparent),transparent_68%)]',
        'sm:mx-auto sm:my-6 sm:h-[calc(100svh-3rem)] sm:max-w-[440px] sm:rounded-2xl sm:border sm:border-midnight-600 sm:shadow-device',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export function ScreenTop({ children, className }: ScreenSlotProps) {
  return (
    <header
      className={cn(
        'relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 pt-safe pb-2',
        className,
      )}
    >
      {children}
    </header>
  )
}

export function ScreenBody({ children, className }: ScreenSlotProps) {
  return (
    <div
      className={cn(
        'relative z-10 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 scrollbar-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ScreenFooter({ children, className }: ScreenSlotProps) {
  return (
    <div
      className={cn(
        'relative z-10 flex shrink-0 flex-col items-center gap-3 px-5 pt-3 pb-safe',
        className,
      )}
    >
      {children}
    </div>
  )
}
