import { GET as healthGet } from '../api/health.ts'
import { POST as marketsPost } from '../api/prediction/markets.ts'

async function run(): Promise<void> {
  console.log('Testing GET /api/health...')
  const healthResponse = await healthGet()
  const healthBody = await healthResponse.text()
  console.log(`  status: ${healthResponse.status}`)
  console.log(`  body: ${healthBody}`)

  if (!healthResponse.ok) {
    throw new Error('Health check failed')
  }

  console.log('\nTesting POST /api/prediction/markets...')
  const marketsResponse = await marketsPost(
    new Request('http://localhost/api/prediction/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'bitcoin' }),
    }),
  )
  const marketsBody = await marketsResponse.text()
  console.log(`  status: ${marketsResponse.status}`)
  console.log(`  body: ${marketsBody.slice(0, 500)}${marketsBody.length > 500 ? '...' : ''}`)

  if (!marketsResponse.ok) {
    throw new Error('Markets search failed')
  }

  const parsed = JSON.parse(marketsBody) as {
    data?: { markets?: unknown[]; isSimulated?: boolean; message?: string }
  }

  if (!parsed.data?.markets?.length) {
    throw new Error('Expected at least one market in response')
  }

  console.log('\nLocal API smoke test passed.')
}

run().catch((error) => {
  console.error('\nLocal API smoke test failed.')
  console.error(error)
  process.exit(1)
})
