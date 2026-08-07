import { SwapServiceError } from './errors.js'

export function toRawAmount(humanAmount: number, decimals: number): bigint {
  if (!Number.isFinite(humanAmount) || humanAmount <= 0) {
    throw new SwapServiceError('Amount must be greater than zero', 400, 'INVALID_AMOUNT')
  }

  const fixed = humanAmount.toFixed(decimals)
  const [wholePart, fractionPart = ''] = fixed.split('.')
  const raw = BigInt(wholePart + fractionPart.padEnd(decimals, '0'))

  if (raw <= 0n) {
    throw new SwapServiceError('Amount must be greater than zero', 400, 'INVALID_AMOUNT')
  }

  return raw
}

export function fromRawAmount(raw: bigint | string | number, decimals: number): number {
  const value = BigInt(raw)
  const base = 10n ** BigInt(decimals)
  const whole = value / base
  const fraction = value % base
  const asNumber = Number(whole) + Number(fraction) / Number(base)

  if (!Number.isFinite(asNumber)) {
    throw new SwapServiceError('Unable to convert token amount', 500, 'AMOUNT_OVERFLOW')
  }

  return asNumber
}

export function percentOfBalance(balanceRaw: bigint, percent: number): bigint {
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw new SwapServiceError(
      'walletPercentage must be between 0 and 100',
      400,
      'INVALID_PERCENT',
    )
  }

  const bps = BigInt(Math.round(percent * 100))
  const amount = (balanceRaw * bps) / 10_000n

  if (amount <= 0n) {
    throw new SwapServiceError(
      'Computed swap amount is zero — wallet balance too low for this percentage',
      400,
      'AMOUNT_TOO_SMALL',
    )
  }

  return amount
}
