import type { PredictionMarket } from '../../../shared/contracts/prediction-market'
import type {
  PredictionQuote,
  SwapQuote,
} from '../../../shared/contracts/quote'
import type {
  TrendingToken,
  WalletHolding,
} from '../../lib/mock/mock-data'

export type DiloAttachment =
  | { kind: 'balance'; totalUsd: number; holdings: readonly WalletHolding[] }
  | { kind: 'tokens'; tokens: readonly TrendingToken[] }
  | { kind: 'markets'; markets: readonly PredictionMarket[] }
  | { kind: 'swap'; quote: SwapQuote }
  | { kind: 'prediction'; quote: PredictionQuote }
  | { kind: 'connect' }

export interface ChatMessage {
  id: string
  author: 'user' | 'dilo'
  text: string
  attachment?: DiloAttachment
  createdAt: number
}

export interface DiloReply {
  text: string
  attachment?: DiloAttachment
  followUps: readonly string[]
}
