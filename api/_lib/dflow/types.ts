export interface DflowMarketAccount {
  yesMint?: string
  noMint?: string
  marketLedger?: string
}

export interface DflowMarket {
  ticker: string
  eventTicker: string
  title: string
  subtitle?: string
  status?: string
  closeTime?: number | string
  yesAsk?: string | null
  yesBid?: string | null
  noAsk?: string | null
  noBid?: string | null
  accounts?: Record<string, DflowMarketAccount>
}

export interface DflowEvent {
  ticker: string
  title: string
  subtitle?: string
  markets?: DflowMarket[] | null
}

export interface DflowEventsResponse {
  events?: DflowEvent[]
}

export interface DflowOrderResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  minOutAmount?: string
  otherAmountThreshold?: string
  priceImpactPct?: string
  lastValidBlockHeight?: number
  transaction?: string
  prioritizationFeeLamports?: number
}

export interface DflowProofResponse {
  verified: boolean
}
