import { getTrendingTokens } from '../_lib/tokens/trending.js'
import { jsonResponse } from '../_lib/http.js'

export async function GET(): Promise<Response> {
  const result = await getTrendingTokens()
  return jsonResponse({ data: result })
}

export async function POST(): Promise<Response> {
  return GET()
}
