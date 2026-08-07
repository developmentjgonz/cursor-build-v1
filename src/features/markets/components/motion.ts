import type { MotionProps } from 'motion/react'

const listSpring = {
  type: 'spring' as const,
  stiffness: 320,
  damping: 34,
}

const pressSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 26,
}

// A list gets one entrance, not a per-item stagger. The authored moments on
// these two tabs are the segmented pill and the probability bars; everything
// else arrives quietly so those two stay legible.
function getGroupEntrance(isReducedMotion: boolean): MotionProps {
  if (isReducedMotion) {
    return {}
  }

  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: listSpring,
  }
}

export { getGroupEntrance, listSpring, pressSpring }
