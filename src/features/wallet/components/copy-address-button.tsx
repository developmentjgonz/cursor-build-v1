import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface CopyAddressButtonProps {
  address: string
}

const confirmationDurationMs = 2000

export function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    if (!hasCopied) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setHasCopied(false)
    }, confirmationDurationMs)

    return () => window.clearTimeout(timeoutId)
  }, [hasCopied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address)
      setHasCopied(true)
    } catch {
      setHasCopied(false)
    }
  }

  const Icon = hasCopied ? Check : Copy

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        onClick={handleCopy}
        aria-label={`Copy wallet address ${address}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-midnight-600 bg-midnight-850 px-3.5 text-[0.8125rem] font-bold tabular-nums text-muted transition-colors hover:border-aqua hover:text-ink"
      >
        {shortenAddress(address)}
        <Icon
          className={hasCopied ? 'size-4 text-mint' : 'size-4'}
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </motion.button>

      <span
        aria-live="polite"
        className="text-[0.75rem] font-bold text-mint"
      >
        <AnimatePresence initial={false}>
          {hasCopied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-block"
            >
              Copied
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </div>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}
