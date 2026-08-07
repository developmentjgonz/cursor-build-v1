import { ArrowLeft } from 'lucide-react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { Button } from '../../components/ui/button'
import type {
  MockTradeQuote,
  MockTradeResult,
  MockWalletSnapshot,
} from '../wallet/use-mock-wallet'
import { ChatComposer } from './components/chat-composer'
import { ChatEmptyState } from './components/chat-empty-state'
import { ChatMessageRow } from './components/chat-message'
import { SuggestionChip } from './components/suggestion-chip'
import { ThinkingIndicator } from './components/thinking-indicator'
import type { DiloChat } from './use-dilo-chat'

interface ChatViewProps {
  chat: DiloChat
  getWalletSnapshot: () => MockWalletSnapshot
  applyConfirmedTrade: (quote: MockTradeQuote) => MockTradeResult
  onLeaveChat?: () => void
}

export function ChatView({
  chat,
  getWalletSnapshot,
  applyConfirmedTrade,
  onLeaveChat,
}: ChatViewProps) {
  const {
    messages,
    followUps,
    isThinking,
    sendMessage,
    receiveVoiceReply,
    receiveVoiceTokens,
    confirmPendingTrade,
  } = chat
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
      {onLeaveChat ? (
        <div className="flex shrink-0 items-center px-3 pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveChat}
            className="-ml-1 min-h-11 gap-1.5 px-2.5 text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Home</span>
          </Button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 scrollbar-none">
        {messages.length === 0 ? (
          <ChatEmptyState onSelect={sendMessage} />
        ) : (
          // Turn rhythm lives on the rows themselves rather than a uniform
          // container gap: a new turn opens with generous space while a
          // bubble and its attachment stay a few pixels apart, and that
          // difference is what makes the thread scannable.
          <div
            role="log"
            aria-label="Conversation with Dilo"
            className="flex flex-col pb-2"
          >
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <ChatMessageRow
                  key={message.id}
                  message={message}
                  isFirstOfRun={
                    index === 0 || messages[index - 1].author !== message.author
                  }
                  onFollowUp={sendMessage}
                  onApproveTrade={confirmPendingTrade}
                />
              ))}

              {isThinking ? <ThinkingIndicator key="thinking" /> : null}
            </AnimatePresence>

            {hasFollowUps ? (
              // Indented to the avatar gutter (avatar 26px + 10px gap) so the
              // chips hang off the reply they belong to. The vertical padding
              // keeps focus rings from being clipped by the scroller.
              <div
                role="group"
                aria-label="Suggested follow-ups"
                className="mt-1 flex gap-2 overflow-x-auto py-1.5 pr-1.5 pl-9 scrollbar-none"
              >
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

      <ChatComposer
        isThinking={isThinking}
        onSend={sendMessage}
        onVoiceReply={receiveVoiceReply}
        onVoiceTokens={receiveVoiceTokens}
        getWalletSnapshot={getWalletSnapshot}
        applyConfirmedTrade={applyConfirmedTrade}
      />
    </div>
  )
}
