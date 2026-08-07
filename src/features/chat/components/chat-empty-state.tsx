import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { SuggestionChip } from './suggestion-chip'

interface ChatEmptyStateProps {
  onSelect: (prompt: string) => void
}

// Every prompt here is one the mock brain recognises, so a tap always lands on
// a real answer instead of the fallback reply.
const starterPrompts: readonly string[] = [
  'How much money do I have?',
  'What are the hottest memecoins?',
  'Swap $5 of SOL into USDC',
  'Put $2 on YES for the Fed cut',
]

export function ChatEmptyState({ onSelect }: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 py-10 text-center">
      <DiloAvatar mood="waving" size={104} hasGlow label="Dilo" />

      <div className="flex flex-col gap-2">
        <h2 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.035em] text-ink">
          What would you like to do?
        </h2>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          Ask in plain words. Dilo builds the transaction and shows you every
          number before anything is signed.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {starterPrompts.map((prompt) => (
          <SuggestionChip key={prompt} prompt={prompt} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
