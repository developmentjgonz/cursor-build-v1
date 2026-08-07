import { ArrowUp } from 'lucide-react'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import { Button } from '../../../components/ui/button'

interface ChatComposerProps {
  isThinking: boolean
  onSend: (prompt: string) => void
}

const maxVisibleLines = 5

export function ChatComposer({ isThinking, onSend }: ChatComposerProps) {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = prompt.trim().length > 0 && !isThinking

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    // Collapse first so scrollHeight reports the content height, not the last
    // height we set.
    textarea.style.height = 'auto'

    const styles = window.getComputedStyle(textarea)
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24
    const verticalPadding =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom)
    const maxHeight = lineHeight * maxVisibleLines + verticalPadding

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  useLayoutEffect(() => {
    resizeTextarea()
  }, [prompt, resizeTextarea])

  const send = useCallback(() => {
    if (!canSend) {
      return
    }

    onSend(prompt)
    setPrompt('')
  }, [canSend, onSend, prompt])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    send()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-20 shrink-0 border-t border-midnight-700 bg-midnight-950/90 px-5 py-3 backdrop-blur-xl"
    >
      <div className="flex items-end gap-2 rounded-xl border border-midnight-600 bg-midnight-850 py-2 pr-2 pl-4 transition-colors focus-within:border-aqua">
        <label className="sr-only" htmlFor="chat-prompt">
          Ask Dilo anything
        </label>
        <textarea
          id="chat-prompt"
          name="chat-prompt"
          ref={textareaRef}
          rows={1}
          value={prompt}
          maxLength={1_000}
          placeholder="Ask Dilo anything…"
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-11 w-full resize-none bg-transparent py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none scrollbar-none placeholder:text-midnight-400"
        />
        <Button
          type="submit"
          variant="brand"
          size="icon"
          disabled={!canSend}
          aria-label="Send message"
        >
          <ArrowUp className="size-5" strokeWidth={2.8} aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
