import { motion, useReducedMotion } from 'motion/react'

import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { cn } from '../../../lib/cn'
import type { ChatMessage } from '../chat-types'
import { DiloAttachment } from './dilo-attachment'

export const avatarSize = 26

export const messageTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 34,
} as const

// The row's resting state is the default one, so a message is legible even if
// the entrance never runs.
const restingState = { opacity: 1, y: 0 }

interface ChatMessageRowProps {
  message: ChatMessage
  isFirstOfRun: boolean
  onFollowUp: (prompt: string) => void
  onApproveTrade?: () => void
}

export function ChatMessageRow({
  message,
  isFirstOfRun,
  onFollowUp,
  onApproveTrade,
}: ChatMessageRowProps) {
  const isDilo = message.author === 'dilo'
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      initial={prefersReducedMotion ? restingState : { opacity: 0, y: 6 }}
      animate={restingState}
      exit={prefersReducedMotion ? restingState : { opacity: 0, y: -4 }}
      transition={messageTransition}
      className={cn(
        'flex w-full gap-2.5',
        isFirstOfRun ? 'mt-5' : 'mt-1.5',
        isDilo ? 'justify-start' : 'justify-end',
      )}
    >
      {isDilo ? (
        <span className="shrink-0 pt-0.5" style={{ width: avatarSize }}>
          {isFirstOfRun ? <DiloAvatar mood="idle" size={avatarSize} /> : null}
        </span>
      ) : null}

      <div
        className={cn(
          'flex min-w-0 flex-col gap-2',
          isDilo ? 'flex-1 items-start' : 'max-w-[82%] items-end',
        )}
      >
        <p
          className={cn(
            // `wrap-anywhere` also caps the bubble's min-content width, so an
            // unbroken 300-character token can never widen the row.
            'max-w-full rounded-lg px-3.5 py-2.5 text-[0.9375rem] leading-relaxed wrap-anywhere',
            isDilo
              ? 'rounded-tl-xs bg-midnight-800 text-ink'
              : 'rounded-tr-xs bg-brand font-semibold text-on-brand',
          )}
        >
          <span className="sr-only">{isDilo ? 'Dilo said: ' : 'You said: '}</span>
          {message.text}
        </p>

        {message.attachment ? (
          <div className="w-full">
            <DiloAttachment
              attachment={message.attachment}
              onFollowUp={onFollowUp}
              onApproveTrade={onApproveTrade}
            />
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}
