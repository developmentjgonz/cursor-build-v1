export interface ServerEnv {
  dflowMetadataBaseUrl: string
  dflowTradeBaseUrl: string
  dflowProofBaseUrl: string
  dflowApiKey: string | undefined
  usdcMint: string
  forceSimulated: boolean
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function getServerEnv(): ServerEnv {
  return {
    dflowMetadataBaseUrl:
      readEnv('DFLOW_METADATA_API_URL') ??
      readEnv('DFLOW_API_BASE_URL') ??
      'https://dev-prediction-markets-api.dflow.net',
    dflowTradeBaseUrl:
      readEnv('DFLOW_TRADE_API_URL') ??
      'https://dev-quote-api.dflow.net',
    dflowProofBaseUrl:
      readEnv('DFLOW_PROOF_API_URL') ?? 'https://proof.dflow.net',
    dflowApiKey: readEnv('DFLOW_API_KEY'),
    usdcMint:
      readEnv('USDC_MINT') ??
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    forceSimulated: readEnv('PREDICTION_MODE') === 'simulated',
  }
}
