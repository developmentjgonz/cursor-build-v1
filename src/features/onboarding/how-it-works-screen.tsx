import {
  ArrowLeft,
  KeyRound,
  MessageSquareText,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

import { Button } from '../../components/ui/button'
import { InfoCard } from '../../components/ui/panel'
import {
  Screen,
  ScreenBody,
  ScreenFooter,
  ScreenTop,
} from '../../components/ui/screen'

interface HowItWorksScreenProps {
  onContinue: () => void
  onBack: () => void
}

interface HowItWorksStep {
  id: string
  title: string
  body: string
  Icon: LucideIcon
}

const steps: readonly HowItWorksStep[] = [
  {
    id: 'describe',
    title: 'Say it in your own words',
    body: 'Type what you want to do in English or Spanish. No tickers, routes, or slippage settings to learn.',
    Icon: MessageSquareText,
  },
  {
    id: 'review',
    title: 'Read the Intent Receipt',
    body: 'Dilo shows the exact amounts, the route it will take, and every fee before anything moves.',
    Icon: ReceiptText,
  },
  {
    id: 'sign',
    title: 'Sign it yourself',
    body: 'The transaction opens in your own wallet. Dilo never holds your keys and cannot move your funds.',
    Icon: KeyRound,
  },
]

export function HowItWorksScreen({ onContinue, onBack }: HowItWorksScreenProps) {
  const shouldReduceMotion = useReducedMotion()
  const rise = shouldReduceMotion ? 0 : 10

  const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
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
      <ScreenTop>
        <Button
          variant="subtle"
          size="icon"
          onClick={onBack}
          aria-label="Back to welcome"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-faint">
          How Dilo works
        </span>
        <span className="size-11 shrink-0" aria-hidden="true" />
      </ScreenTop>

      <ScreenBody className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.035em]">
            Three steps, every time
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            Dilo prepares the transaction and explains it. You stay in control of
            the wallet and the final word.
          </p>
        </div>

        <motion.ol
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {steps.map(({ id, title, body, Icon }, index) => (
            <motion.li key={id} variants={itemVariants}>
              <InfoCard
                icon={
                  <span className="text-[0.9375rem] font-extrabold tabular-nums">
                    {index + 1}
                  </span>
                }
                title={title}
                body={body}
                trailing={<Icon className="size-5" strokeWidth={2.2} />}
              />
            </motion.li>
          ))}
        </motion.ol>
      </ScreenBody>

      <ScreenFooter>
        <Button variant="brand" size="lg" block onClick={onContinue}>
          Add funds
        </Button>
        <p className="text-[0.8125rem] text-faint">
          You can add funds later from your wallet.
        </p>
      </ScreenFooter>
    </Screen>
  )
}
