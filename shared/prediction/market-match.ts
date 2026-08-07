import type { PredictionMarket } from '../contracts/prediction-market.js'

/**
 * Shared market ranking/matching used by the API search path and the chat/
 * voice reply builders. Keeps “best market” and query filtering consistent.
 */

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'at',
  'by',
  'with',
  'from',
  'into',
  'that',
  'this',
  'these',
  'those',
  'is',
  'are',
  'was',
  'were',
  'be',
  'will',
  'would',
  'can',
  'could',
  'should',
  'do',
  'does',
  'did',
  'me',
  'my',
  'your',
  'our',
  'show',
  'open',
  'what',
  'which',
  'how',
  'much',
  'put',
  'bet',
  'bets',
  'wager',
  'apuesta',
  'odds',
  'yes',
  'no',
  'side',
  'market',
  'markets',
  'prediction',
  'mercados',
  'about',
  'please',
  'dollars',
  'bucks',
  'usd',
])

const MIN_MATCH_SCORE = 1

export function tokenizeMarketQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9$]+/)
    .map((token) => token.replace(/^\$+/, ''))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

export function scoreMarketAgainstQuery(
  market: PredictionMarket,
  query: string,
): number {
  const tokens = tokenizeMarketQuery(query)
  if (tokens.length === 0) {
    return 0
  }

  const haystack = `${market.id} ${market.title} ${market.category ?? ''}`.toLowerCase()
  let score = 0

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length >= 4 ? 2 : 1
    }
  }

  const normalizedTitle = market.title.toLowerCase()
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedTitle === normalizedQuery) {
    score += 10
  } else if (
    normalizedTitle.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedTitle)
  ) {
    score += 4
  }

  return score
}

export function filterAndRankMarkets(
  markets: readonly PredictionMarket[],
  query: string,
): PredictionMarket[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return [...markets]
  }

  const ranked = markets
    .map((market) => ({
      market,
      score: scoreMarketAgainstQuery(market, trimmedQuery),
    }))
    .filter(({ score }) => score >= MIN_MATCH_SCORE)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return (right.market.volumeUsd ?? 0) - (left.market.volumeUsd ?? 0)
    })
    .map(({ market }) => market)

  return ranked
}

export function findBestMarketMatch(
  markets: readonly PredictionMarket[],
  prompt: string,
  marketQuery = '',
): PredictionMarket | undefined {
  if (markets.length === 0) {
    return undefined
  }

  const quotedTitle = /["“](.+?)["”]/.exec(prompt)?.[1]?.trim()
  if (quotedTitle) {
    const normalizedQuoted = quotedTitle.toLowerCase()
    const exact = markets.find(
      (market) => market.title.toLowerCase() === normalizedQuoted,
    )
    if (exact) {
      return exact
    }

    const partial = markets.find((market) =>
      market.title.toLowerCase().includes(normalizedQuoted),
    )
    if (partial) {
      return partial
    }
  }

  const query = marketQuery.trim() || prompt
  const ranked = filterAndRankMarkets(markets, query)
  return ranked[0]
}

/**
 * Parse an explicit YES/NO side from natural language.
 * Avoids treating incidental “no” (“there is no cut”) as the NO side.
 */
export function parsePredictionOutcome(prompt: string): 'YES' | 'NO' {
  const normalized = prompt.toLowerCase()

  const explicitNo =
    /\b(?:on|for)\s+no\b/.test(normalized) ||
    /\bno\s+side\b/.test(normalized) ||
    /\b(?:bet|wager|apuesta)\s+against\b/.test(normalized)
  const explicitYes =
    /\b(?:on|for)\s+yes\b/.test(normalized) ||
    /\byes\s+side\b/.test(normalized)

  if (explicitNo && !explicitYes) {
    return 'NO'
  }

  if (explicitYes) {
    return 'YES'
  }

  // “Put $2 that X won’t happen” without an explicit side → still YES on the
  // negated proposition is wrong; prefer asking via tools in voice. Text chat
  // keeps YES only when no negation cue is present.
  if (
    /\b(?:won'?t|will not|does not|doesn't|ain't)\b/.test(normalized) &&
    !/\b(?:on|for)\s+yes\b/.test(normalized)
  ) {
    return 'NO'
  }

  return 'YES'
}
