import { cn } from '../../lib/cn'

interface TokenMarkProps {
  symbol: string
  size?: 'sm' | 'md'
  className?: string
}

// Deterministic hue per symbol keeps a token's mark stable across every view.
const tints: readonly string[] = [
  'from-mint/35 to-aqua/25 text-mint',
  'from-violet-neon/35 to-magenta-neon/25 text-violet-neon',
  'from-aqua/35 to-violet-neon/25 text-aqua',
  'from-magenta-neon/35 to-violet-neon/25 text-magenta-neon',
  'from-warn/30 to-magenta-neon/20 text-warn',
]

export function TokenMark({ symbol, size = 'md', className }: TokenMarkProps) {
  let hash = 0
  for (let index = 0; index < symbol.length; index += 1) {
    hash = (hash + symbol.charCodeAt(index) * (index + 7)) % 997
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-extrabold ring-1 ring-inset ring-white/10',
        tints[hash % tints.length],
        size === 'md' ? 'size-10 text-[0.8125rem]' : 'size-8 text-[0.6875rem]',
        className,
      )}
    >
      {symbol.slice(0, 3)}
    </span>
  )
}
