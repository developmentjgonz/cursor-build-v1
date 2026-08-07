import type { Connect, Plugin } from 'vite'
import { loadEnv } from 'vite'

const apiRouteModules: Record<string, string> = {
  '/api/intent': './api/intent.ts',
  '/api/prediction/markets': './api/prediction/markets.ts',
  '/api/prediction/quote': './api/prediction/quote.ts',
  '/api/prediction/eligibility': './api/prediction/eligibility.ts',
  '/api/prediction/transaction': './api/prediction/transaction.ts',
  '/api/realtime/session': './api/realtime/session.ts',
  '/api/swap/quote': './api/swap/quote.ts',
  '/api/swap/transaction': './api/swap/transaction.ts',
  '/api/tokens/trending': './api/tokens/trending.ts',
  '/api/tokens/prices': './api/tokens/prices.ts',
}

function applyEnv(env: Record<string, string>): void {
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

async function readRequestBody(
  req: Connect.IncomingMessage,
): Promise<Uint8Array | undefined> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return undefined
  }

  return new Uint8Array(Buffer.concat(chunks))
}

export function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      applyEnv(loadEnv(server.config.mode, server.config.root, ''))

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        const modulePath = apiRouteModules[path]

        if (!modulePath || !req.method) {
          next()
          return
        }

        try {
          const mod = (await server.ssrLoadModule(modulePath)) as Record<
            string,
            (request: Request) => Promise<Response>
          >
          const handler = mod[req.method]

          if (!handler) {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: {
                  code: 'METHOD_NOT_ALLOWED',
                  message: `${req.method} is not supported for ${path}`,
                },
              }),
            )
            return
          }

          const rawBody =
            req.method === 'GET' || req.method === 'HEAD'
              ? undefined
              : await readRequestBody(req)
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
              headers.set(key, value)
            } else if (Array.isArray(value)) {
              headers.set(key, value.join(', '))
            }
          }

          const request = new Request(
            new URL(req.url ?? path, 'http://localhost'),
            {
              method: req.method,
              headers,
              body: rawBody,
            },
          )
          const response = await handler(request)
          const responseBody = Buffer.from(await response.arrayBuffer())

          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          res.end(responseBody)
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: {
                code: 'LOCAL_API_ERROR',
                message:
                  error instanceof Error
                    ? error.message
                    : 'Local API handler failed',
              },
            }),
          )
        }
      })
    },
  }
}
