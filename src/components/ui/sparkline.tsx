import { useId } from 'react'

import { cn } from '../../lib/cn'

interface SparklineProps {
  values: readonly number[]
  isPositive: boolean
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  values,
  isPositive,
  width = 60,
  height = 26,
  className,
}: SparklineProps) {
  const gradientId = useId()
  const geometry = buildGeometry(values, width, height)
  const strokeColor = isPositive ? 'var(--color-up)' : 'var(--color-down)'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0 overflow-visible', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={geometry.area} fill={`url(#${gradientId})`} />
      <path
        d={geometry.line}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function buildGeometry(
  values: readonly number[],
  width: number,
  height: number,
): { line: string; area: string } {
  if (values.length === 0) {
    return { line: '', area: '' }
  }

  let minimum = values[0]
  let maximum = values[0]

  for (const value of values) {
    if (value < minimum) {
      minimum = value
    }
    if (value > maximum) {
      maximum = value
    }
  }

  const range = maximum - minimum || 1
  const stepX = width / Math.max(values.length - 1, 1)

  const points = values.map((value, index) => {
    const x = index * stepX
    const y = height - ((value - minimum) / range) * (height - 5) - 2.5

    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const line = `M${points.join('L')}`
  const area = `${line}L${width},${height}L0,${height}Z`

  return { line, area }
}
