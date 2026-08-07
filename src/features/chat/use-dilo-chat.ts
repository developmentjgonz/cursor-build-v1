import { useCallback, useEffect, useRef, useState } from 'react'

import type { ChatMessage } from './chat-types'
import { createDiloReply } from './mock-dilo-brain'

const thinkingDelayMs = 850

function createMessageId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface DiloChat {
  messages: readonly ChatMessage[]
  followUps: readonly string[]
  isThinking: boolean
  sendMessage: (prompt: string) => void
}

export function useDiloChat(): DiloChat {
  // The thread starts empty so the chat surface can greet with its own empty
  // state and starter prompts instead of a lone welcome bubble.
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [followUps, setFollowUps] = useState<readonly string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const sendMessage = useCallback((prompt: string) => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId(),
        author: 'user',
        text: trimmedPrompt,
        createdAt: Date.now(),
      },
    ])
    setFollowUps([])
    setIsThinking(true)

    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      const reply = createDiloReply(trimmedPrompt)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          author: 'dilo',
          text: reply.text,
          attachment: reply.attachment,
          createdAt: Date.now(),
        },
      ])
      setFollowUps(reply.followUps)
      setIsThinking(false)
    }, thinkingDelayMs)
  }, [])

  return { messages, followUps, isThinking, sendMessage }
}
