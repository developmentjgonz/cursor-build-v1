import { LoaderCircle, Mic, TriangleAlert } from 'lucide-react'

import { cn } from '../../../lib/cn'
import type { RealtimeVoiceStatus } from '../../chat/use-realtime-voice'

interface VoiceGuideStatusProps {
  status: RealtimeVoiceStatus
  errorMessage?: string | null
  className?: string
}

const labels: Partial<Record<RealtimeVoiceStatus, string>> = {
  connecting: 'Dilo is joining…',
  listening: 'Dilo is listening…',
  processing: 'Dilo is on it…',
  speaking: 'Dilo is speaking…',
}

export function VoiceGuideStatus({
  status,
  errorMessage,
  className,
}: VoiceGuideStatusProps) {
  if (status === 'disconnected') {
    return null
  }

  const isError = status === 'error'
  const label = isError
    ? (errorMessage ?? 'Voice hiccup — buttons still work.')
    : (labels[status] ?? '')

  if (!label) {
    return null
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 text-[0.8125rem]',
        isError ? 'text-warn' : 'text-faint',
        className,
      )}
    >
      {isError ? (
        <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      ) : status === 'connecting' || status === 'processing' ? (
        <LoaderCircle
          className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Mic className="size-3.5 shrink-0 text-aqua" aria-hidden="true" />
      )}
      <span className="min-w-0 truncate">{label}</span>
    </p>
  )
}
