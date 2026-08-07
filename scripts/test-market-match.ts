import assert from 'node:assert/strict'

import type { PredictionMarket } from '../shared/contracts/prediction-market.ts'
import {
  filterAndRankMarkets,
  findBestMarketMatch,
  parsePredictionOutcome,
  tokenizeMarketQuery,
} from '../shared/prediction/market-match.ts'

const markets: PredictionMarket[] = [
  {
    id: 'SIM-BTC-150K-DEC26',
    title: 'Will Bitcoin reach $150,000 by December 2026?',
    yesProbability: 0.42,
    noProbability: 0.58,
    closesAt: '2026-12-31T23:59:59.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
  {
    id: 'SIM-FED-RATE-CUT-JUN26',
    title: 'Will the Fed cut rates at the June 2026 FOMC meeting?',
    yesProbability: 0.61,
    noProbability: 0.39,
    closesAt: '2026-06-17T18:00:00.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
  {
    id: 'SIM-NBA-FINALS-2026',
    title: 'Will the Boston Celtics win the 2026 NBA Finals?',
    yesProbability: 0.19,
    noProbability: 0.81,
    closesAt: '2026-06-30T23:59:59.000Z',
    isTradingAvailable: true,
    isSimulated: true,
  },
]

function run(): void {
  assert.deepEqual(tokenizeMarketQuery('Show me bitcoin markets'), ['bitcoin'])
  assert.deepEqual(tokenizeMarketQuery('put $2 on YES for Fed rate cut'), [
    'fed',
    'rate',
    'cut',
  ])

  const fedMarkets = filterAndRankMarkets(markets, 'Fed rate cut')
  assert.equal(fedMarkets[0]?.id, 'SIM-FED-RATE-CUT-JUN26')
  assert.equal(
    filterAndRankMarkets(markets, 'unrelated mars colony').length,
    0,
  )

  const best = findBestMarketMatch(
    markets,
    'Put $2 on YES for the Fed rate cut',
    'Fed rate cut',
  )
  assert.equal(best?.id, 'SIM-FED-RATE-CUT-JUN26')

  // Must not fall back to markets[0] (bitcoin) for an unmatched query.
  assert.equal(
    findBestMarketMatch(markets, 'mars colony odds', 'mars colony'),
    undefined,
  )

  assert.equal(parsePredictionOutcome('Put $2 on YES for bitcoin'), 'YES')
  assert.equal(parsePredictionOutcome('Put $2 on NO for bitcoin'), 'NO')
  assert.equal(
    parsePredictionOutcome('Put $2 on YES that there is no rate cut'),
    'YES',
  )
  assert.equal(parsePredictionOutcome('Bet against the Celtics'), 'NO')

  console.log('Market match tests passed.')
}

run()
