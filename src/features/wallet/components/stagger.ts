import type { MotionProps } from 'motion/react'

const listSpring = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 34,
}

const staggerStepSeconds = 0.04

export function getStaggerProps(
  index: number,
  isReducedMotion: boolean,
): MotionProps {
  if (isReducedMotion) {
    return {}
  }

  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...listSpring, delay: index * staggerStepSeconds },
  }
}

export { listSpring }
