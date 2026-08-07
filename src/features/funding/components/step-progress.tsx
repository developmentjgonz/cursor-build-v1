import { cn } from '../../../lib/cn'

interface StepProgressProps {
  currentIndex: number
  labels: readonly string[]
  className?: string
}

export function StepProgress({
  currentIndex,
  labels,
  className,
}: StepProgressProps) {
  const currentLabel = labels[currentIndex] ?? ''

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={labels.length}
      aria-valuenow={currentIndex + 1}
      aria-valuetext={`Step ${currentIndex + 1} of ${labels.length}: ${currentLabel}`}
      className={cn('flex items-center gap-1', className)}
    >
      {labels.map((label, index) => (
        <span
          key={label}
          className={cn(
            'h-0.5 flex-1 rounded-full transition-colors duration-300',
            index <= currentIndex ? 'bg-brand' : 'bg-midnight-700',
          )}
        />
      ))}
    </div>
  )
}
