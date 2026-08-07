import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { ChatComposer } from './components/chat-composer'
import { ChatEmptyState } from './components/chat-empty-state'
import { ChatMessageRow } from './components/chat-message'
import { SuggestionChip } from './components/suggestion-chip'
import { ThinkingIndicator } from './components/thinking-indicator'
import type { DiloChat } from './use-dilo-chat'

interface ChatViewProps {
  chat: DiloChat
}

export function ChatView({ chat }: ChatViewProps) {
  const { messages, followUps, isThinking, sendMessage } = chat
  const prefersReducedMotion = useReducedMotion()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      block: 'end',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [messages, isThinking, prefersReducedMotion])

  const latestMessage = messages[messages.length - 1]
  const hasFollowUps =
    !isThinking && followUps.length > 0 && latestMessage?.author === 'dilo'

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 scrollbar-none">
        {messages.length === 0 ? (
          <ChatEmptyState onSelect={sendMessage} />
        ) : (
          <div
            role="log"
            aria-label="Conversation with Dilo"
            className="flex flex-col gap-3 pt-3 pb-4"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessageRow
                  key={message.id}
                  message={message}
                  isFirstOfRun={
                    index === 0 || messages[index - 1].author !== message.author
                  }
                  onFollowUp={sendMessage}
                />
              ))}

              {isThinking ? <ThinkingIndicator key="thinking" /> : null}
            </AnimatePresence>

            {hasFollowUps ? (
              <div className="flex gap-2 overflow-x-auto pb-1 pl-[36px] scrollbar-none">
                {followUps.map((followUp) => (
                  <SuggestionChip
                    key={followUp}
                    prompt={followUp}
                    onSelect={sendMessage}
                  />
                ))}
              </div>
            ) : null}

            <div ref={bottomRef} aria-hidden="true" className="h-px" />
          </div>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {isThinking ? 'Dilo is thinking' : ''}
      </p>

      <ChatComposer isThinking={isThinking} onSend={sendMessage} />
    </div>
  )
}
