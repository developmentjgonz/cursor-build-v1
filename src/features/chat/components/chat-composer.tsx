import { ArrowUp, Mic, Square, TriangleAlert } from 'lucide-react'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

import type { TrendingToken } from '../../../../shared/contracts/token'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'
import type { DiloReply } from '../chat-types'
import {
  useRealtimeVoice,
  type RealtimeVoiceStatus,
} from '../use-realtime-voice'

interface ChatComposerProps {
  isThinking: boolean
  onSend: (prompt: string) => void
  onVoiceReply: (prompt: string, reply: DiloReply) => void
  onVoiceTokens: (
    prompt: string,
    tokens: readonly TrendingToken[],
    summary: string,
  ) => void
}

const maxVisibleLines = 5

const voiceStatusLabels: Partial<Record<RealtimeVoiceStatus, string>> = {
  connecting: 'Connecting voice…',
  listening: 'Listening… Tap stop when you are done.',
  processing: 'Checking live data…',
  speaking: 'Dilo is speaking…',
}

export function ChatComposer({
  isThinking,
  onSend,
  onVoiceReply,
  onVoiceTokens,
}: ChatComposerProps) {
  const [prompt, setPrompt] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Voice stays conversational by default. These callbacks only fire when
  // Dilo sets showInChat after the user asks to see something on screen.
  const voice = useRealtimeVoice({
    onTradePrepared: onVoiceReply,
    onMarketsQuoted: onVoiceReply,
    onTokensQuoted: onVoiceTokens,
    onTradeCompleted: onVoiceReply,
  })
  const canSend = prompt.trim().length > 0 && !isThinking
  const isVoiceActive =
    voice.status !== 'disconnected' && voice.status !== 'error'
  const hasVoiceError = voice.status === 'error'
  const voiceMessage = hasVoiceError
    ? (voice.errorMessage ?? 'Voice is unavailable right now.')
    : (voiceStatusLabels[voice.status] ?? '')

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

  function handleVoiceClick() {
    if (isVoiceActive) {
      voice.stop()
      return
    }

    void voice.start()
  }

  return (
    // Solid rather than translucent: the tab bar underneath is opaque
    // midnight-950, and a blurred 90% panel above it split the bottom of the
    // screen into two slightly different darks. The border-t is the only rule
    // in this region — the tab bar draws a scrim instead of a second one.
    <form
      onSubmit={handleSubmit}
      className="relative z-20 shrink-0 border-t border-midnight-700 bg-midnight-950 px-5 pt-1.5 pb-2"
    >
      {/* Always in the layout, empty or not. Mounting this line only while a
          voice session ran pushed the whole thread up by a row mid-sentence,
          and a live region has to exist before its text changes to announce. */}
      <p
        role="status"
        className={cn(
          'mb-1 flex h-4 items-center gap-1.5 text-[0.8125rem] leading-4',
          hasVoiceError ? 'text-down' : 'text-faint',
        )}
      >
        {voiceMessage ? (
          <>
            {hasVoiceError ? (
              <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            ) : null}
            <span className="truncate">{voiceMessage}</span>
          </>
        ) : null}
      </p>

      {/* Scoped to the textarea rather than `focus-within`, so tabbing to the
          send button shows one focus ring instead of two. */}
      <div className="flex items-end gap-2 rounded-lg border border-midnight-600 bg-midnight-850 py-2 pr-2 pl-4 transition-colors has-[textarea:focus-visible]:border-aqua has-[textarea:focus-visible]:ring-1 has-[textarea:focus-visible]:ring-aqua">
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
          className="min-h-11 w-full resize-none bg-transparent py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none scrollbar-none placeholder:text-faint"
        />

        {/* The two controls sit in their own tight pair so the row reads as a
            field plus one action cluster, not three loose objects. */}
        <span className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!voice.isSupported}
            aria-label={
              isVoiceActive
                ? 'Stop voice conversation'
                : 'Start voice conversation'
            }
            aria-pressed={isVoiceActive}
            onClick={handleVoiceClick}
            className={cn(
              'disabled:text-faint',
              isVoiceActive
                ? 'bg-aqua/15 text-aqua hover:bg-aqua/25'
                : 'text-muted hover:bg-midnight-700 hover:text-ink',
            )}
          >
            {isVoiceActive ? (
              <Square className="size-4 fill-current" aria-hidden="true" />
            ) : (
              <Mic className="size-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            type="submit"
            variant="brand"
            size="icon"
            disabled={!canSend}
            aria-label="Send message"
            className="disabled:text-faint"
          >
            <ArrowUp className="size-5" strokeWidth={2.8} aria-hidden="true" />
          </Button>
        </span>
      </div>
    </form>
  )
}
