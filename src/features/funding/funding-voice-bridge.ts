import type { DepositMethodId } from './deposit-model'

export type FundingFlowStep =
  | 'amount'
  | 'method'
  | 'card'
  | 'review'
  | 'success'

export interface FundingVoiceBridge {
  getStep: () => FundingFlowStep | 'processing'
  setAmountUsd: (amountUsd: number) => string
  setMethod: (methodId: DepositMethodId) => string
  continueForward: () => string
  confirmDeposit: () => string
  finish: () => string
}
