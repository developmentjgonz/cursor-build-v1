import { Check, Copy, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

import { pressSpring } from '../../markets/components/motion'

interface CopyAddressButtonProps {
  address: string
}

type CopyStatus = 'idle' | 'copied' | 'failed'

const confirmationDurationMs = 2000

export function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const isReducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setStatus('idle')
    }, confirmationDurationMs)

    return () => window.clearTimeout(timeoutId)
  }, [status])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  const hasCopied = status === 'copied'
  const Icon = hasCopied ? Check : Copy

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        transition={pressSpring}
        onClick={handleCopy}
        aria-label={`Copy wallet address ${address}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-midnight-600 bg-midnight-850 px-4 text-[0.8125rem] font-bold tabular-nums text-muted transition-colors hover:border-aqua hover:text-ink active:bg-midnight-800"
      >
        {shortenAddress(address)}
        <Icon
          className={hasCopied ? 'size-4 text-mint' : 'size-4'}
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </motion.button>

      {/* Confirmation and failure both carry an icon and a word, never a tint
          on its own. */}
      <p
        aria-live="polite"
        className="inline-flex min-h-5 items-center gap-1 text-[0.75rem] font-bold"
      >
        <AnimatePresence initial={false} mode="wait">
          {status === 'idle' ? null : (
            <motion.span
              key={status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isReducedMotion ? 0 : 0.16 }}
              className={
                hasCopied
                  ? 'inline-flex items-center gap-1 text-mint'
                  : 'inline-flex items-center gap-1 text-warn'
              }
            >
              {hasCopied ? (
                <Check className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
              ) : (
                <TriangleAlert
                  className="size-3.5"
                  strokeWidth={2.6}
                  aria-hidden="true"
                />
              )}
              {hasCopied ? 'Copied' : 'Copy failed'}
            </motion.span>
          )}
        </AnimatePresence>
      </p>
    </div>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}
