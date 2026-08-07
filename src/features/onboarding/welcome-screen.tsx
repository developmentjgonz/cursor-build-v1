import { Languages, ScanEye, ShieldCheck, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

import { DiloWordmark } from '../../components/brand/dilo-wordmark'
import { DiloAvatar } from '../../components/dilo/dilo-avatar'
import { Button } from '../../components/ui/button'
import { Screen, ScreenBody, ScreenFooter } from '../../components/ui/screen'
import { TrustChip } from './components/trust-chip'

interface WelcomeScreenProps {
  onCreateWallet: () => void
  onUseExistingWallet: () => void
}

interface TrustPoint {
  id: string
  label: string
  Icon: LucideIcon
}

const trustPoints: readonly TrustPoint[] = [
  { id: 'self-custody', label: 'Self-custody', Icon: ShieldCheck },
  { id: 'languages', label: 'English & Spanish', Icon: Languages },
  { id: 'review', label: 'Review before signing', Icon: ScanEye },
]

export function WelcomeScreen({
  onCreateWallet,
  onUseExistingWallet,
}: WelcomeScreenProps) {
  const shouldReduceMotion = useReducedMotion()
  const rise = shouldReduceMotion ? 0 : 10

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 320, damping: 34 },
    },
  }

  return (
    <Screen>
      <ScreenBody className="flex flex-col pt-safe">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="m-auto flex w-full flex-col items-center gap-6 py-6 text-center"
        >
          <motion.div variants={itemVariants}>
            <DiloAvatar
              mood="waving"
              size={148}
              hasGlow
              label="Dilo, waving hello"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <h1 className="flex justify-center">
              <span className="sr-only">Dilo</span>
              <span aria-hidden="true">
                <DiloWordmark size="xl" />
              </span>
            </h1>
            <p className="text-balance text-[0.9375rem] leading-relaxed text-muted">
              Say what you want to do. Dilo builds the transaction. You sign it.
            </p>
          </motion.div>

          <motion.ul
            variants={listVariants}
            className="flex flex-wrap justify-center gap-2"
          >
            {trustPoints.map(({ id, label, Icon }) => (
              <motion.li key={id} variants={itemVariants}>
                <TrustChip Icon={Icon} label={label} />
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </ScreenBody>

      <ScreenFooter>
        <Button variant="brand" size="lg" block onClick={onCreateWallet}>
          Create a wallet
        </Button>
        <Button variant="ghost" size="md" block onClick={onUseExistingWallet}>
          I already have a wallet
        </Button>
      </ScreenFooter>
    </Screen>
  )
}
