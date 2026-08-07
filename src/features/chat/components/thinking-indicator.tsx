import { motion, useReducedMotion } from 'motion/react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { avatarSize } from './chat-message'

const dotDelaysMs: readonly number[] = [0, 140, 280]

export function ThinkingIndicator() {
  const prefersReducedMotion = useReducedMotion()

  // A plain fade rather than the message rows' rise: this is a placeholder for
  // a turn, not the turn itself, and repeating the message entrance on it made
  // every arrival feel like two.
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mt-5 flex w-full gap-2.5"
    >
      <span className="shrink-0 pt-0.5" style={{ width: avatarSize }}>
        <DiloAvatar mood="thinking" size={avatarSize} />
      </span>

      <span
        className="inline-flex h-9 items-center gap-1.5 rounded-lg rounded-tl-xs bg-midnight-800 px-3.5"
        aria-hidden="true"
      >
        {dotDelaysMs.map((delayMs) => (
          <span
            key={delayMs}
            className="size-1.5 animate-typing rounded-full bg-midnight-200 motion-reduce:animate-none"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </span>
    </motion.div>
  )
}
