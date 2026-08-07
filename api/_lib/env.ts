export interface ServerEnv {
  quicknodeRpcUrl: string
  usingFallbackRpc: boolean
  jupiterApiBaseUrl: string
  defaultSlippageBps: number
  solanaCommitment: 'processed' | 'confirmed' | 'finalized'
  dflowMetadataBaseUrl: string
  dflowTradeBaseUrl: string
  dflowProofBaseUrl: string
  dflowApiKey: string | undefined
  usdcMint: string
  forceSimulated: boolean
}

const PUBLIC_SOLANA_RPC = 'https://api.mainnet-beta.solana.com'

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function getServerEnv(): ServerEnv {
  const quicknodeRpcUrl = readEnv('QUICKNODE_RPC_URL')
  const commitment = readEnv('SOLANA_COMMITMENT')
  const slippage = Number(readEnv('DEFAULT_SLIPPAGE_BPS') ?? '50')

  return {
    quicknodeRpcUrl: quicknodeRpcUrl ?? PUBLIC_SOLANA_RPC,
    usingFallbackRpc: !quicknodeRpcUrl,
    jupiterApiBaseUrl: (
      readEnv('JUPITER_API_BASE_URL') ?? 'https://public.jupiterapi.com'
    ).replace(/\/$/, ''),
    defaultSlippageBps:
      Number.isFinite(slippage) && slippage > 0 ? Math.floor(slippage) : 50,
    solanaCommitment:
      commitment === 'processed' ||
      commitment === 'confirmed' ||
      commitment === 'finalized'
        ? commitment
        : 'confirmed',
    dflowMetadataBaseUrl:
      readEnv('DFLOW_METADATA_API_URL') ??
      readEnv('DFLOW_API_BASE_URL') ??
      'https://dev-prediction-markets-api.dflow.net',
    dflowTradeBaseUrl:
      readEnv('DFLOW_TRADE_API_URL') ?? 'https://dev-quote-api.dflow.net',
    dflowProofBaseUrl:
      readEnv('DFLOW_PROOF_API_URL') ?? 'https://proof.dflow.net',
    dflowApiKey: readEnv('DFLOW_API_KEY'),
    usdcMint:
      readEnv('USDC_MINT') ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    forceSimulated: readEnv('PREDICTION_MODE') === 'simulated',
  }
}
