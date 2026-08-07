import { Apple, CreditCard, Landmark, type LucideIcon } from 'lucide-react'

export type PaymentMethodId = 'apple-pay' | 'debit-card' | 'bank-transfer'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  feeRate: number
  arrival: string
  Icon: LucideIcon
}

export const paymentMethods: readonly PaymentMethod[] = [
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    feeRate: 0.015,
    arrival: 'Arrives in about a minute',
    Icon: Apple,
  },
  {
    id: 'debit-card',
    label: 'Debit card',
    feeRate: 0.025,
    arrival: 'Arrives in about five minutes',
    Icon: CreditCard,
  },
  {
    id: 'bank-transfer',
    label: 'Bank transfer',
    feeRate: 0,
    arrival: 'Arrives in one to two business days',
    Icon: Landmark,
  },
]

export function findPaymentMethod(id: PaymentMethodId): PaymentMethod {
  return paymentMethods.find((method) => method.id === id) ?? paymentMethods[0]
}

// Fees are quoted to the cent, so the rate is rounded before it reaches the
// review summary and the total.
export function calculateFeeUsd(amountUsd: number, feeRate: number): number {
  return Math.round(amountUsd * feeRate * 100) / 100
}
