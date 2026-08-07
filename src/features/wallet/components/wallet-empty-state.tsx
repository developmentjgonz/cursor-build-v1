import { LoaderCircle } from 'lucide-react'

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
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <DiloAvatar mood="curious" size={112} hasGlow />

      <h1 className="mt-5 text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em] text-ink">
        No wallet connected
      </h1>

      <p className="mt-2 max-w-[19rem] text-[0.9375rem] leading-relaxed text-muted">
        Connect a wallet to see your balance, holdings and history here. You can
        keep chatting with me in the meantime.
      </p>

      <Button
        variant="brand"
        size="lg"
        block
        onClick={onConnect}
        disabled={isConnecting}
        aria-busy={isConnecting}
        className="mt-7"
      >
        {isConnecting ? (
          <>
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              strokeWidth={2.6}
              aria-hidden="true"
            />
            Waiting for Phantom…
          </>
        ) : (
          'Connect Phantom'
        )}
      </Button>

      <p aria-live="polite" className="sr-only">
        {isConnecting
          ? 'Waiting for Phantom to approve the connection.'
          : ''}
      </p>
    </div>
  )
}
