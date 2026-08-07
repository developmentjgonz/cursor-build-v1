import { DiloAvatar } from '../../../components/dilo/dilo-avatar'
import { Button } from '../../../components/ui/button'

interface WalletEmptyStateProps {
  isConnecting: boolean
  onConnect: () => void
}

export function WalletEmptyState({
  isConnecting,
  onConnect,
}: WalletEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <DiloAvatar mood="curious" size={112} hasGlow />

      <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em] text-ink">
        No wallet connected
      </h1>

      <p className="max-w-[19rem] text-[0.9375rem] leading-relaxed text-muted">
        Connect a wallet to see your balance, holdings and history here. You can
        keep chatting with me in the meantime.
      </p>

      <Button
        variant="brand"
        size="lg"
        block
        onClick={onConnect}
        disabled={isConnecting}
        className="mt-1"
      >
        {isConnecting ? 'Waiting for your wallet…' : 'Connect wallet'}
      </Button>
    </div>
  )
}
