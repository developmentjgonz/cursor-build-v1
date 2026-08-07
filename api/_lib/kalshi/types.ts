export interface KalshiMarket {
  ticker: string
  event_ticker?: string
  title?: string
  status?: string
  close_time?: string
  yes_ask_dollars?: string
  yes_bid_dollars?: string
  no_ask_dollars?: string
  no_bid_dollars?: string
  last_price_dollars?: string
  volume_fp?: string
  volume_24h_fp?: string
  open_interest_fp?: string
  category?: string
}

export interface KalshiEvent {
  event_ticker: string
  title?: string
  category?: string
  series_ticker?: string
  markets?: KalshiMarket[] | null
}

export interface KalshiEventsResponse {
  events?: KalshiEvent[]
  cursor?: string
}

export interface KalshiMarketsResponse {
  markets?: KalshiMarket[]
  cursor?: string
}
