import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'

interface SuggestionChipProps {
  prompt: string
  onSelect: (prompt: string) => void
  className?: string
}

export function SuggestionChip({
  prompt,
  onSelect,
  className,
}: SuggestionChipProps) {
  return (
    <Button
      variant="subtle"
      size="md"
      onClick={() => onSelect(prompt)}
      className={cn(
        'shrink-0 rounded-full px-4 text-[0.8125rem] font-semibold hover:border-aqua',
        className,
      )}
    >
      {prompt}
    </Button>
  )
}
