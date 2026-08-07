import type { PredictionMarket } from '../../../shared/contracts/prediction-market'

const dayMs = 24 * 60 * 60 * 1000

export function formatMarketClosesAt(closesAt: string): string {
  const closesAtMs = Date.parse(closesAt)

  if (Number.isNaN(closesAtMs)) {
    return 'Close date unavailable'
  }

  const remainingMs = closesAtMs - Date.now()

  if (remainingMs <= 0) {
    return 'Closed'
  }

  const remainingDays = Math.ceil(remainingMs / dayMs)

  if (remainingDays <= 1) {
    return 'Closes today'
  }

  if (remainingDays < 14) {
    return `Closes in ${remainingDays} days`
  }

  if (remainingDays < 60) {
    return `Closes in ${Math.ceil(remainingDays / 7)} weeks`
  }

  return `Closes in ${Math.ceil(remainingDays / 30)} months`
}

export function getMarketCategory(market: PredictionMarket): string {
  return market.category?.trim() || 'Markets'
}
