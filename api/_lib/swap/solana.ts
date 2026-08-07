import {
  Connection,
  PublicKey,
  type Commitment,
  type TransactionConfirmationStrategy,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { getServerEnv } from '../env.js'
import { fromRawAmount } from './amounts.js'
import { SwapServiceError } from './errors.js'
import { NATIVE_SOL_MINT, resolveToken } from './tokens.js'

let connection: Connection | null = null

function getConnection(): Connection {
  if (!connection) {
    const { quicknodeRpcUrl, solanaCommitment } = getServerEnv()
    connection = new Connection(quicknodeRpcUrl, {
      commitment: solanaCommitment as Commitment,
    })
  }

  return connection
}

export function assertValidWallet(walletAddress: string): string {
  try {
    return new PublicKey(walletAddress).toBase58()
  } catch {
    throw new SwapServiceError('Invalid wallet public key', 400, 'INVALID_WALLET')
  }
}

export interface TokenBalance {
  symbol: string
  mint: string
  decimals: number
  amountRaw: string
  amount: number
}

export async function getWalletBalances(walletAddress: string): Promise<{
  walletAddress: string
  balances: TokenBalance[]
  rpc: 'quicknode' | 'public-fallback'
}> {
  const owner = new PublicKey(assertValidWallet(walletAddress))
  const conn = getConnection()
  const { usingFallbackRpc, solanaCommitment } = getServerEnv()

  const [lamports, tokenAccounts] = await Promise.all([
    conn.getBalance(owner, solanaCommitment),
    conn.getParsedTokenAccountsByOwner(
      owner,
      { programId: TOKEN_PROGRAM_ID },
      solanaCommitment,
    ),
  ])

  let solRaw = BigInt(lamports)
  const balances: TokenBalance[] = []

  for (const { account } of tokenAccounts.value) {
    const parsed = account.data.parsed?.info as
      | {
          mint?: string
          tokenAmount?: {
            amount?: string
            decimals?: number
            uiAmount?: number | null
          }
        }
      | undefined

    if (!parsed?.mint) {
      continue
    }

    const mint = parsed.mint
    const amountRaw = parsed.tokenAmount?.amount ?? '0'
    if (amountRaw === '0') {
      continue
    }

    if (mint === NATIVE_SOL_MINT) {
      solRaw += BigInt(amountRaw)
      continue
    }

    const decimals = parsed.tokenAmount?.decimals ?? 0
    let symbol = mint.slice(0, 4)
    try {
      symbol = resolveToken(mint).symbol
    } catch {
      // unknown mint — keep truncated mint as symbol
    }

    balances.push({
      symbol,
      mint,
      decimals,
      amountRaw,
      amount: fromRawAmount(amountRaw, decimals),
    })
  }

  balances.unshift({
    symbol: 'SOL',
    mint: NATIVE_SOL_MINT,
    decimals: 9,
    amountRaw: solRaw.toString(),
    amount: fromRawAmount(solRaw, 9),
  })

  return {
    walletAddress: owner.toBase58(),
    balances,
    rpc: usingFallbackRpc ? 'public-fallback' : 'quicknode',
  }
}

export async function getTokenBalanceRaw(
  walletAddress: string,
  mintOrSymbol: string,
): Promise<{ amountRaw: bigint; decimals: number }> {
  const token = resolveToken(mintOrSymbol)
  const { balances } = await getWalletBalances(walletAddress)
  const match = balances.find((balance) => balance.mint === token.mint)

  if (!match) {
    return { amountRaw: 0n, decimals: token.decimals }
  }

  return { amountRaw: BigInt(match.amountRaw), decimals: match.decimals }
}

export async function sendSignedTransaction(
  signedTransactionBase64: string,
): Promise<string> {
  const conn = getConnection()
  const { solanaCommitment } = getServerEnv()
  const raw = Buffer.from(signedTransactionBase64, 'base64')

  try {
    return await conn.sendRawTransaction(raw, {
      skipPreflight: false,
      preflightCommitment: solanaCommitment,
      maxRetries: 3,
    })
  } catch (error) {
    throw new SwapServiceError(
      error instanceof Error ? error.message : 'Failed to broadcast transaction',
      502,
      'BROADCAST_FAILED',
      error,
    )
  }
}

export async function confirmSignature(signature: string): Promise<{
  signature: string
  confirmed: boolean
  err: unknown
  slot?: number
}> {
  const conn = getConnection()
  const { solanaCommitment } = getServerEnv()
  const latest = await conn.getLatestBlockhash(solanaCommitment)

  const strategy: TransactionConfirmationStrategy = {
    signature,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  }

  const result = await conn.confirmTransaction(strategy, solanaCommitment)

  return {
    signature,
    confirmed: result.value.err === null,
    err: result.value.err,
    slot: result.context.slot,
  }
}
