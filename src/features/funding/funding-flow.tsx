import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '../../components/ui/button'
import {
  Screen,
  ScreenBody,
  ScreenFooter,
  ScreenTop,
} from '../../components/ui/screen'
import { DiloWordmark } from '../../components/brand/dilo-wordmark'
import {
  applyAmountKey,
  parseAmountInput,
  type AmountKey,
} from './components/amount-keypad'
import { AmountStep } from './components/amount-step'
import { MethodStep } from './components/method-step'
import {
  calculateFeeUsd,
  findPaymentMethod,
  type PaymentMethodId,
} from './components/payment-methods'
import { ProcessingStep } from './components/processing-step'
import { ReviewStep } from './components/review-step'
import { StepProgress } from './components/step-progress'
import { SuccessStep } from './components/success-step'

interface FundingFlowProps {
  onComplete: (depositedUsd: number) => void
  onBack: () => void
}

type FundingStep = 'amount' | 'method' | 'review' | 'processing' | 'success'

const stepOrder: readonly FundingStep[] = [
  'amount',
  'method',
  'review',
  'processing',
  'success',
]

const progressLabels: readonly string[] = ['Amount', 'Method', 'Review']

const minimumUsd = 10
const processingDurationMs = 1600

export function FundingFlow({ onComplete, onBack }: FundingFlowProps) {
  const shouldReduceMotion = useReducedMotion()
  const [step, setStep] = useState<FundingStep>('amount')
  const [direction, setDirection] = useState(1)
  const [amountInput, setAmountInput] = useState('50')
  const [methodId, setMethodId] = useState<PaymentMethodId>('apple-pay')
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const amountUsd = parseAmountInput(amountInput)
  const method = findPaymentMethod(methodId)
  const feeUsd = calculateFeeUsd(amountUsd, method.feeRate)
  const totalUsd = amountUsd + feeUsd
  const isBelowMinimum = amountUsd < minimumUsd

  const goToStep = useCallback((nextStep: FundingStep) => {
    setDirection(stepOrder.indexOf(nextStep) >= stepOrder.indexOf(step) ? 1 : -1)
    setStep(nextStep)
  }, [step])

  const handleKeyPress = useCallback((key: AmountKey) => {
    setAmountInput((currentInput) => applyAmountKey(currentInput, key))
  }, [])

  const handleQuickPick = useCallback((nextAmountUsd: number) => {
    setAmountInput(String(nextAmountUsd))
  }, [])

  const handleConfirm = useCallback(() => {
    goToStep('processing')
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setDirection(1)
      setStep('success')
    }, processingDurationMs)
  }, [goToStep])

  const handleBack = useCallback(() => {
    if (step === 'amount') {
      onBack()
      return
    }

    if (step === 'method') {
      goToStep('amount')
      return
    }

    if (step === 'review') {
      goToStep('method')
    }
  }, [goToStep, onBack, step])

  const isBackVisible =
    step === 'amount' || step === 'method' || step === 'review'
  const progressIndex = Math.min(stepOrder.indexOf(step), 2)
  const slideOffset = shouldReduceMotion ? 0 : 28 * direction

  return (
    <Screen>
      <ScreenTop>
        {isBackVisible ? (
          <Button
            variant="subtle"
            size="icon"
            onClick={handleBack}
            aria-label={step === 'amount' ? 'Back to how Dilo works' : 'Back'}
          >
            <ArrowLeft className="size-5" strokeWidth={2.4} aria-hidden="true" />
          </Button>
        ) : (
          <span className="size-11" aria-hidden="true" />
        )}

        {isBackVisible ? (
          <StepProgress currentIndex={progressIndex} labels={progressLabels} />
        ) : (
          <DiloWordmark size="sm" />
        )}

        <span className="size-11" aria-hidden="true" />
      </ScreenTop>

      <ScreenBody className="flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: slideOffset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideOffset }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="flex min-h-full flex-col"
          >
            {step === 'amount' ? (
              <AmountStep
                amountInput={amountInput}
                amountUsd={amountUsd}
                minimumUsd={minimumUsd}
                onKeyPress={handleKeyPress}
                onQuickPick={handleQuickPick}
              />
            ) : null}

            {step === 'method' ? (
              <MethodStep
                amountUsd={amountUsd}
                selectedMethodId={methodId}
                onSelectMethod={setMethodId}
              />
            ) : null}

            {step === 'review' ? (
              <ReviewStep
                amountUsd={amountUsd}
                feeUsd={feeUsd}
                totalUsd={totalUsd}
                method={method}
              />
            ) : null}

            {step === 'processing' ? (
              <ProcessingStep amountUsd={amountUsd} methodLabel={method.label} />
            ) : null}

            {step === 'success' ? (
              <SuccessStep amountUsd={amountUsd} methodLabel={method.label} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </ScreenBody>

      <ScreenFooter>
        {step === 'amount' ? (
          <Button block disabled={isBelowMinimum} onClick={() => goToStep('method')}>
            Continue
          </Button>
        ) : null}

        {step === 'method' ? (
          <Button block onClick={() => goToStep('review')}>
            Review deposit
          </Button>
        ) : null}

        {step === 'review' ? (
          <Button block onClick={handleConfirm}>
            Confirm deposit
          </Button>
        ) : null}

        {step === 'success' ? (
          <Button block onClick={() => onComplete(amountUsd)}>
            Start using Dilo
          </Button>
        ) : null}
      </ScreenFooter>
    </Screen>
  )
}
