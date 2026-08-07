import { CreditCard, Landmark, type LucideIcon } from 'lucide-react'

export type DepositMethodId = 'card' | 'ach'

export interface DepositMethod {
  id: DepositMethodId
  segmentLabel: string
  title: string
  highlight: string
  highlightClassName: string
  description: string
  Icon: LucideIcon
}

export interface AmountPreset {
  valueUsd: number
  caption: string
  captionClassName: string
  isPopular: boolean
}

export const minimumDepositUsd = 10

// Card processors take their cut out of the deposit, so the wallet receives the
// amount minus the fee. ACH settles slower and costs nothing.
export const cardFeeRate = 0.03

export const depositMethods: readonly DepositMethod[] = [
  {
    id: 'card',
    segmentLabel: 'Card',
    title: 'Instant deposit',
    highlight: 'Using debit or credit card',
    highlightClassName: 'text-aqua',
    description:
      'Funds are added instantly so you can get started right away.',
    Icon: CreditCard,
  },
  {
    id: 'ach',
    segmentLabel: 'ACH',
    title: 'ACH',
    highlight: '1–3 business days from your bank account',
    highlightClassName: 'text-mint',
    description:
      'A safe and reliable way to add funds directly from your bank.',
    Icon: Landmark,
  },
]

export const amountPresets: readonly AmountPreset[] = [
  {
    valueUsd: 25,
    caption: 'Good start',
    captionClassName: 'text-mint',
    isPopular: false,
  },
  {
    valueUsd: 50,
    caption: 'Most popular',
    captionClassName: 'text-magenta-neon',
    isPopular: true,
  },
  {
    valueUsd: 100,
    caption: 'More balance',
    captionClassName: 'text-aqua',
    isPopular: false,
  },
]

export const quickAmountsUsd: readonly number[] = [25, 50, 100, 250]

export function findDepositMethod(id: DepositMethodId): DepositMethod {
  return depositMethods.find((method) => method.id === id) ?? depositMethods[0]
}

export function parseAmountInput(input: string): number {
  const parsed = Number.parseFloat(input.replace(/[^\d.]/g, ''))

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

// Fees are quoted to the cent, so the rate is rounded once here and every
// downstream total reuses the rounded value.
export function calculateFeeUsd(
  amountUsd: number,
  methodId: DepositMethodId,
): number {
  if (methodId === 'ach') {
    return 0
  }

  return Math.round(amountUsd * cardFeeRate * 100) / 100
}

export function calculateNetUsd(
  amountUsd: number,
  methodId: DepositMethodId,
): number {
  return Math.max(0, amountUsd - calculateFeeUsd(amountUsd, methodId))
}
