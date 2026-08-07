const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const compactUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const smallPriceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
})

const tokenFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
})

export function formatUsd(value: number): string {
  if (value > 0 && value < 0.01) {
    return `<${usdFormatter.format(0.01)}`
  }

  return usdFormatter.format(value)
}

export function formatCompactUsd(value: number): string {
  return compactUsdFormatter.format(value)
}

// Memecoins trade far below a cent, so prices keep significant digits instead
// of rounding to the nearest cent.
export function formatPrice(value: number): string {
  if (value >= 1) {
    return usdFormatter.format(value)
  }

  return smallPriceFormatter.format(value)
}

export function formatTokenAmount(value: number, symbol: string): string {
  return `${tokenFormatter.format(value)} ${symbol}`
}

export function formatSignedPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)}%`
}

export function formatProbability(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}
