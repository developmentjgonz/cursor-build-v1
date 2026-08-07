import { cn } from '../../lib/cn'

interface DiloWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClassNames: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
}

export function DiloWordmark({ size = 'md', className }: DiloWordmarkProps) {
  return (
    <span
      className={cn(
        'text-brand inline-block font-extrabold tracking-[-0.045em]',
        sizeClassNames[size],
        className,
      )}
    >
      Dilo
    </span>
  )
}
