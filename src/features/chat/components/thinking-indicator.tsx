import { motion } from 'motion/react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { avatarSize, messageTransition } from './chat-message'

const dotDelaysMs: readonly number[] = [0, 140, 280]

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={messageTransition}
      className="flex w-full items-center gap-2.5"
    >
      <DiloAvatar mood="thinking" size={avatarSize} />

      <span
        className="inline-flex items-center gap-1.5 rounded-lg rounded-tl-xs bg-midnight-800 px-3.5 py-3.5"
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
