import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react'

import { Button } from '../../components/ui/button'
import {
  Screen,
  ScreenBody,
  ScreenFooter,
  ScreenTop,
} from '../../components/ui/screen'
import { DiloWordmark } from '../../components/brand/dilo-wordmark'
import { formatUsd } from '../../lib/format'
import {
  emptyCardDetails,
  isCardComplete,
  type CardDetails,
} from './card-details'
import { AmountStep } from './components/amount-step'
import { CardStep } from './components/card-step'
import { MethodStep } from './components/method-step'
import { ProcessingStep } from './components/processing-step'
import { ReviewStep } from './components/review-step'
import { StepProgress } from './components/step-progress'
import { SuccessStep } from './components/success-step'
import {
  amountPresets,
  calculateFeeUsd,
  calculateNetUsd,
  findDepositMethod,
  minimumDepositUsd,
  parseAmountInput,
  type DepositMethodId,
} from './deposit-model'
import type { RealtimeVoiceStatus } from '../chat/use-realtime-voice'
import { VoiceGuideStatus } from '../onboarding/components/voice-guide-status'
import type { FundingVoiceBridge } from './funding-voice-bridge'

type DepositStep = 'amount' | 'method' | 'card' | 'review' | 'success'

interface FundingFlowProps {
  onComplete: (depositedUsd: number) => void
  onBack: () => void
  voiceBridgeRef?: Ref<FundingVoiceBridge | null>
  onStepChange?: (step: DepositStep | 'processing') => void
  voiceStatus?: RealtimeVoiceStatus
  voiceErrorMessage?: string | null
}

const cardStepOrder: readonly DepositStep[] = [
  'amount',
  'method',
  'card',
  'review',
  'success',
]

const achStepOrder: readonly DepositStep[] = [
  'amount',
  'method',
  'review',
  'success',
]

const cardStepLabels: readonly string[] = ['Amount', 'Method', 'Card', 'Review']
const achStepLabels: readonly string[] = ['Amount', 'Method', 'Review']

const processingDurationMs = 1600

function matchesPreset(valueUsd: number): boolean {
  return amountPresets.some((preset) => preset.valueUsd === valueUsd)
}

export function FundingFlow({
  onComplete,
  onBack,
  voiceBridgeRef,
  onStepChange,
  voiceStatus = 'disconnected',
  voiceErrorMessage = null,
}: FundingFlowProps) {
  const shouldReduceMotion = useReducedMotion()
  const [step, setStep] = useState<DepositStep>('amount')
  const [direction, setDirection] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [amountInput, setAmountInput] = useState('25')
  const [amountSource, setAmountSource] = useState<'preset' | 'custom'>('preset')
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [methodId, setMethodId] = useState<DepositMethodId>('card')
  const [card, setCard] = useState<CardDetails>(emptyCardDetails)
  const timeoutRef = useRef<number | undefined>(undefined)
  const helperId = useId()

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const amountUsd = parseAmountInput(amountInput)
  const method = findDepositMethod(methodId)
  const feeUsd = calculateFeeUsd(amountUsd, methodId)
  const netUsd = calculateNetUsd(amountUsd, methodId)
  const isBelowMinimum = amountUsd < minimumDepositUsd
  const isCardReady = isCardComplete(card)

  const stepOrder = methodId === 'ach' ? achStepOrder : cardStepOrder
  const stepLabels = methodId === 'ach' ? achStepLabels : cardStepLabels

  useEffect(() => {
    onStepChange?.(isProcessing ? 'processing' : step)
  }, [isProcessing, onStepChange, step])

  const goToStep = useCallback(
    (nextStep: DepositStep) => {
      setDirection(
        stepOrder.indexOf(nextStep) >= stepOrder.indexOf(step) ? 1 : -1,
      )
      setStep(nextStep)
    },
    [step, stepOrder],
  )

  const goForward = useCallback(() => {
    const nextStep = stepOrder[stepOrder.indexOf(step) + 1]

    if (nextStep) {
      goToStep(nextStep)
    }
  }, [goToStep, step, stepOrder])

  const handleBack = useCallback(() => {
    const currentIndex = stepOrder.indexOf(step)

    if (currentIndex <= 0) {
      onBack()
      return
    }

    goToStep(stepOrder[currentIndex - 1])
  }, [goToStep, onBack, step, stepOrder])

  // A value only counts as "custom" while it does not match one of the
  // recommended cards, so stepping back from a quick amount still lights up the
  // card the user actually picked.
  const applyAmount = useCallback((valueUsd: number) => {
    setAmountInput(String(valueUsd))
    setAmountSource(matchesPreset(valueUsd) ? 'preset' : 'custom')
    setIsCustomOpen(false)
  }, [])

  const handleToggleCustom = useCallback(() => {
    const isOpening = !isCustomOpen

    setIsCustomOpen(isOpening)
    setAmountSource(
      isOpening || !matchesPreset(parseAmountInput(amountInput))
        ? 'custom'
        : 'preset',
    )
  }, [amountInput, isCustomOpen])

  const handleChangeAmount = useCallback((value: string) => {
    setAmountInput(value.replace(/[^\d.]/g, '').slice(0, 9))
    setAmountSource('custom')
  }, [])

  const handleConfirm = useCallback(() => {
    setIsProcessing(true)
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setIsProcessing(false)
      setDirection(1)
      setStep('success')
    }, processingDurationMs)
  }, [])

  const handleComplete = useCallback(() => {
    onComplete(netUsd)
  }, [netUsd, onComplete])

  useImperativeHandle(
    voiceBridgeRef,
    () => ({
      getStep: () => (isProcessing ? 'processing' : step),
      setAmountUsd: (nextAmountUsd: number) => {
        if (isProcessing || step === 'success' || step === 'review') {
          return 'Amount is locked on this step.'
        }

        if (nextAmountUsd < minimumDepositUsd) {
          return `Amount must be at least $${minimumDepositUsd}.`
        }

        applyAmount(Math.round(nextAmountUsd * 100) / 100)
        return `Deposit amount set to $${nextAmountUsd}.`
      },
      setMethod: (nextMethodId: DepositMethodId) => {
        if (isProcessing || step === 'success' || step === 'review') {
          return 'Payment method is locked on this step.'
        }

        setMethodId(nextMethodId)
        return nextMethodId === 'card'
          ? 'Using card for an instant deposit.'
          : 'Using bank transfer (ACH).'
      },
      continueForward: () => {
        if (isProcessing) {
          return 'Still processing the deposit.'
        }

        if (step === 'amount' && isBelowMinimum) {
          return `Choose at least $${minimumDepositUsd} before continuing.`
        }

        if (step === 'card' && !isCardReady) {
          return 'Card details are incomplete. Ask the user to finish typing their card on screen.'
        }

        if (step === 'review') {
          return 'On review — call confirm_deposit after they approve.'
        }

        if (step === 'success') {
          return 'Already on success — call finish_funding.'
        }

        goForward()
        return 'Moved to the next funding step.'
      },
      confirmDeposit: () => {
        if (step !== 'review' || isProcessing) {
          return 'Not on the review step yet.'
        }

        handleConfirm()
        return 'Confirming the deposit now.'
      },
      finish: () => {
        if (step !== 'success') {
          return 'Not on the success screen yet.'
        }

        handleComplete()
        return 'Entering the app.'
      },
    }),
    [
      applyAmount,
      goForward,
      handleComplete,
      handleConfirm,
      isBelowMinimum,
      isCardReady,
      isProcessing,
      step,
    ],
  )

  const isSuccess = step === 'success'
  const isReview = step === 'review'
  const isBackVisible = !isSuccess && !isProcessing
  const progressIndex = useMemo(
    () => Math.min(Math.max(stepOrder.indexOf(step), 0), stepLabels.length - 1),
    [step, stepLabels.length, stepOrder],
  )
  const slideOffset = shouldReduceMotion ? 0 : 28 * direction
  const activeKey = isProcessing ? 'processing' : step

  const amountHelper = isBelowMinimum
    ? `Choose at least ${formatUsd(minimumDepositUsd)} to continue.`
    : null
  const cardHelper = isCardReady
    ? null
    : voiceStatus !== 'disconnected' && voiceStatus !== 'error'
      ? 'Type your card on screen now — Dilo won’t ask for the digits out loud.'
      : 'Fill in your card details to review the deposit.'

  return (
    <Screen>
      <ScreenTop className="flex-col items-stretch gap-2.5">
        <div className="flex items-center justify-between gap-3">
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

          {isReview && !isProcessing ? (
            <h1 className="text-base font-bold tracking-[-0.02em] text-ink">
              Review deposit
            </h1>
          ) : (
            <DiloWordmark size="sm" />
          )}

          <span className="size-11" aria-hidden="true" />
        </div>

        {isSuccess ? (
          <span className="block h-0.5" aria-hidden="true" />
        ) : (
          <StepProgress currentIndex={progressIndex} labels={stepLabels} />
        )}
      </ScreenTop>

      <ScreenBody className="flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, x: slideOffset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideOffset }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="flex min-h-full flex-col"
          >
            {isProcessing ? (
              <ProcessingStep
                amountUsd={amountUsd}
                methodLabel={method.segmentLabel}
              />
            ) : null}

            {!isProcessing && step === 'amount' ? (
              <AmountStep
                amountInput={amountInput}
                amountUsd={amountUsd}
                amountSource={amountSource}
                isCustomOpen={isCustomOpen}
                onSelectPreset={applyAmount}
                onToggleCustom={handleToggleCustom}
                onChangeCustom={handleChangeAmount}
              />
            ) : null}

            {!isProcessing && step === 'method' ? (
              <MethodStep methodId={methodId} onSelectMethod={setMethodId} />
            ) : null}

            {!isProcessing && step === 'card' ? (
              <CardStep
                amountInput={amountInput}
                amountUsd={amountUsd}
                card={card}
                onChangeAmount={handleChangeAmount}
                onSelectQuickAmount={applyAmount}
                onChangeCard={setCard}
              />
            ) : null}

            {!isProcessing && step === 'review' ? (
              <ReviewStep
                amountUsd={amountUsd}
                feeUsd={feeUsd}
                netUsd={netUsd}
                methodId={methodId}
                card={card}
              />
            ) : null}

            {!isProcessing && step === 'success' ? (
              <SuccessStep netUsd={netUsd} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </ScreenBody>

      {isProcessing ? null : (
        <ScreenFooter>
          <VoiceGuideStatus
            status={voiceStatus}
            errorMessage={voiceErrorMessage}
          />

          {step === 'amount' ? (
            <>
              {amountHelper ? (
                <p id={helperId} className="text-[0.8125rem] text-faint">
                  {amountHelper}
                </p>
              ) : null}
              <Button
                block
                disabled={isBelowMinimum}
                aria-describedby={amountHelper ? helperId : undefined}
                onClick={goForward}
              >
                Continue
                <ArrowRight className="size-5" strokeWidth={2.4} aria-hidden="true" />
              </Button>
            </>
          ) : null}

          {step === 'method' ? (
            <>
              <Button block onClick={goForward}>
                Continue
              </Button>
              <p className="flex items-center gap-2 text-[0.8125rem] text-faint">
                <Lock className="size-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                We never store your card details.
              </p>
            </>
          ) : null}

          {step === 'card' ? (
            <>
              {cardHelper ? (
                <p id={helperId} className="text-[0.8125rem] text-faint">
                  {cardHelper}
                </p>
              ) : null}
              <Button
                block
                disabled={!isCardReady || isBelowMinimum}
                aria-describedby={cardHelper ? helperId : undefined}
                onClick={goForward}
              >
                Review deposit
                <ArrowRight className="size-5" strokeWidth={2.4} aria-hidden="true" />
              </Button>
            </>
          ) : null}

          {step === 'review' ? (
            <>
              <Button block onClick={handleConfirm}>
                Confirm and deposit
              </Button>
              <p className="flex items-center gap-2 text-center text-[0.8125rem] text-faint">
                <Lock className="size-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                Your payment is secure and encrypted.
              </p>
              <p className="text-[0.8125rem] text-faint">
                Built on Solana · Fast. Secure. Low fees.
              </p>
            </>
          ) : null}

          {step === 'success' ? (
            <>
              <Button block onClick={handleComplete}>
                View balance
                <ArrowRight className="size-5" strokeWidth={2.4} aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="md" block onClick={handleComplete}>
                Done
              </Button>
            </>
          ) : null}
        </ScreenFooter>
      )}
    </Screen>
  )
}
