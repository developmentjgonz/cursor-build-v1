// Mocked card entry. Nothing here is persisted, encrypted, or transmitted —
// the digits live in component state for the length of the flow and nowhere
// else.
export interface CardDetails {
  number: string
  expiry: string
  cvc: string
  name: string
}

export const emptyCardDetails: CardDetails = {
  number: '',
  expiry: '',
  cvc: '',
  name: '',
}

const brandByLeadingDigit: ReadonlyMap<string, string> = new Map([
  ['3', 'Amex'],
  ['4', 'Visa'],
  ['5', 'Mastercard'],
  ['6', 'Discover'],
])

export function toDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCardNumber(value: string): string {
  return toDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatExpiry(value: string): string {
  const digits = toDigits(value).slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

export function formatCvc(value: string): string {
  return toDigits(value).slice(0, 4)
}

export function getCardBrand(card: CardDetails): string {
  return brandByLeadingDigit.get(toDigits(card.number).charAt(0)) ?? 'Card'
}

export function getCardLastFour(card: CardDetails): string {
  return toDigits(card.number).slice(-4)
}

export function isCardComplete(card: CardDetails): boolean {
  return (
    toDigits(card.number).length >= 15 &&
    toDigits(card.expiry).length === 4 &&
    card.cvc.length >= 3 &&
    card.name.trim().length > 1
  )
}
