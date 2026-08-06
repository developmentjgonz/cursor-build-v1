export interface WalletSession {
  address: string
  signTransaction: (transaction: Uint8Array) => Promise<Uint8Array>
}

export interface WalletService {
  connect: () => Promise<WalletSession>
  disconnect: () => Promise<void>
  getActiveSession: () => WalletSession | null
}
