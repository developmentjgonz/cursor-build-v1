import type { WalletEligibility } from '../../../shared/contracts/api'
import { verifyWalletWithProof } from '../dflow/client'
import { resolvePredictionMode } from './mode'

export async function checkWalletEligibility(
  walletAddress: string,
): Promise<WalletEligibility> {
  const mode = resolvePredictionMode()

  if (!mode.useLiveIntegration) {
    return {
      walletAddress,
      isEligible: false,
      requiresKyc: true,
      isSimulated: true,
      message:
        'Simulated mode: live Kalshi trading requires DFlow Proof KYC. You can still review simulated quotes.',
    }
  }

  try {
    const proof = await verifyWalletWithProof(walletAddress)

    if (proof.verified) {
      return {
        walletAddress,
        isEligible: true,
        requiresKyc: false,
        isSimulated: false,
        message: 'Wallet is verified for live Kalshi prediction-market trading.',
      }
    }

    return {
      walletAddress,
      isEligible: false,
      requiresKyc: true,
      isSimulated: false,
      message:
        'This wallet is not verified with DFlow Proof. Complete KYC before live prediction-market execution.',
    }
  } catch {
    return {
      walletAddress,
      isEligible: false,
      requiresKyc: true,
      isSimulated: true,
      message:
        'Wallet eligibility could not be checked against DFlow Proof. Simulated quotes remain available.',
    }
  }
}
