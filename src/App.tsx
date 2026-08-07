import { AnimatePresence } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'

import type { TrendingToken } from '../shared/contracts/token'
import type { DiloReply } from './features/chat/chat-types'
import { AppHeader } from './components/app-shell/app-header'
import {
  BottomNavigation,
  type AppTab,
} from './components/app-shell/bottom-navigation'
import { Screen } from './components/ui/screen'
import { AskHome } from './features/chat/ask-home'
import { ChatView } from './features/chat/chat-view'
import { useDiloChat } from './features/chat/use-dilo-chat'
import type { DepositMethodId } from './features/funding/deposit-model'
import { FundingFlow } from './features/funding/funding-flow'
import type { FundingVoiceBridge } from './features/funding/funding-voice-bridge'
import { MarketsView } from './features/markets/markets-view'
import { ConnectWalletScreen } from './features/onboarding/connect-wallet-screen'
import { CreateWalletScreen } from './features/onboarding/create-wallet-screen'
import { HowItWorksScreen } from './features/onboarding/how-it-works-screen'
import {
  useOnboardingVoice,
  type FundingVoiceStep,
  type OnboardingPhase,
} from './features/onboarding/use-onboarding-voice'
import { useOnboarding } from './features/onboarding/use-onboarding'
import { WelcomeScreen } from './features/onboarding/welcome-screen'
import { useMockWallet } from './features/wallet/use-mock-wallet'
import { WalletView } from './features/wallet/wallet-view'

type AskSurface = 'home' | 'chat'

export function App() {
  const onboarding = useOnboarding()
  const wallet = useMockWallet()
  const chat = useDiloChat({
    getWalletSnapshot: wallet.getSnapshot,
    applyConfirmedTrade: wallet.applyConfirmedTrade,
  })
  const [phase, setPhase] = useState<OnboardingPhase>('welcome')
  const [activeTab, setActiveTab] = useState<AppTab>('ask')
  const [askSurface, setAskSurface] = useState<AskSurface>('home')
  const [fundingStep, setFundingStep] = useState<FundingVoiceStep | null>(null)
  const [connectRequestId, setConnectRequestId] = useState(0)
  const [continueAfterConnectRequestId, setContinueAfterConnectRequestId] =
    useState(0)
  const fundingBridgeRef = useRef<FundingVoiceBridge | null>(null)
  const isWalletConnected =
    wallet.status === 'connected' && wallet.address !== null

  const askDilo = useCallback(
    (prompt: string) => {
      setActiveTab('ask')
      setAskSurface('chat')
      chat.sendMessage(prompt)
    },
    [chat],
  )

  const handleVoiceReply = useCallback(
    (prompt: string, reply: DiloReply) => {
      chat.receiveVoiceReply(prompt, reply)
      setAskSurface('chat')
    },
    [chat],
  )

  const handleVoiceTokens = useCallback(
    (
      prompt: string,
      tokens: readonly TrendingToken[],
      summary: string,
    ) => {
      chat.receiveVoiceTokens(prompt, tokens, summary)
      setAskSurface('chat')
    },
    [chat],
  )

  const handleDeposit = useCallback(
    (depositedUsd: number) => {
      wallet.depositUsd(depositedUsd)
      onboarding.complete()
    },
    [onboarding, wallet],
  )

  const handleExistingWalletConnected = useCallback(() => {
    onboarding.complete()
  }, [onboarding])

  const handleRestartOnboarding = useCallback(() => {
    wallet.disconnect()
    setAskSurface('home')
    setActiveTab('ask')
    setFundingStep(null)
    setConnectRequestId(0)
    setContinueAfterConnectRequestId(0)
    setPhase('welcome')
    onboarding.restart()
  }, [onboarding, wallet])

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab((currentTab) => {
      if (tab === 'ask' && currentTab === 'ask') {
        setAskSurface('home')
      }

      return tab
    })
  }, [])

  const handleBackFromHowItWorks = useCallback(() => {
    wallet.disconnect()
    setPhase('welcome')
  }, [wallet])

  const onboardingVoiceOptions = useMemo(
    () => ({
      isEnabled: !onboarding.hasCompleted,
      phase,
      fundingStep: phase === 'funding' ? fundingStep : null,
      isWalletConnected: phase === 'connect-wallet' && isWalletConnected,
      onCreateWallet: () => setPhase('create-wallet'),
      onUseExistingWallet: () => setPhase('connect-wallet'),
      onContinueHowItWorks: () => setPhase('funding'),
      onConnectPhantom: () => {
        setConnectRequestId((currentId) => currentId + 1)
      },
      onContinueAfterConnect: () => {
        setContinueAfterConnectRequestId((currentId) => currentId + 1)
      },
      onSetDepositAmount: (amountUsd: number) =>
        fundingBridgeRef.current?.setAmountUsd(amountUsd) ??
        'Funding screen is not open yet.',
      onSetDepositMethod: (methodId: DepositMethodId) =>
        fundingBridgeRef.current?.setMethod(methodId) ??
        'Funding screen is not open yet.',
      onContinueFunding: () =>
        fundingBridgeRef.current?.continueForward() ??
        'Funding screen is not open yet.',
      onConfirmDeposit: () =>
        fundingBridgeRef.current?.confirmDeposit() ??
        'Funding screen is not open yet.',
      onFinishFunding: () =>
        fundingBridgeRef.current?.finish() ??
        'Funding screen is not open yet.',
    }),
    [fundingStep, isWalletConnected, onboarding.hasCompleted, phase],
  )

  const onboardingVoice = useOnboardingVoice(onboardingVoiceOptions)

  if (!onboarding.hasCompleted) {
    return (
      <AnimatePresence mode="wait">
        {phase === 'welcome' ? (
          <WelcomeScreen
            key="welcome"
            onCreateWallet={() => setPhase('create-wallet')}
            onUseExistingWallet={() => setPhase('connect-wallet')}
            voiceStatus={onboardingVoice.status}
            voiceErrorMessage={onboardingVoice.errorMessage}
          />
        ) : null}

        {phase === 'create-wallet' ? (
          <CreateWalletScreen
            key="create-wallet"
            wallet={wallet}
            onCreated={() => setPhase('how-it-works')}
            onBack={() => setPhase('welcome')}
            voiceStatus={onboardingVoice.status}
            voiceErrorMessage={onboardingVoice.errorMessage}
          />
        ) : null}

        {phase === 'how-it-works' ? (
          <HowItWorksScreen
            key="how-it-works"
            onContinue={() => setPhase('funding')}
            onBack={handleBackFromHowItWorks}
            voiceStatus={onboardingVoice.status}
            voiceErrorMessage={onboardingVoice.errorMessage}
          />
        ) : null}

        {phase === 'funding' ? (
          <FundingFlow
            key="funding"
            onComplete={handleDeposit}
            onBack={() => setPhase('how-it-works')}
            voiceBridgeRef={fundingBridgeRef}
            onStepChange={setFundingStep}
            voiceStatus={onboardingVoice.status}
            voiceErrorMessage={onboardingVoice.errorMessage}
          />
        ) : null}

        {phase === 'connect-wallet' ? (
          <ConnectWalletScreen
            key="connect-wallet"
            wallet={wallet}
            onContinue={handleExistingWalletConnected}
            onBack={() => setPhase('welcome')}
            connectRequestId={connectRequestId}
            continueRequestId={continueAfterConnectRequestId}
            voiceStatus={onboardingVoice.status}
            voiceErrorMessage={onboardingVoice.errorMessage}
          />
        ) : null}
      </AnimatePresence>
    )
  }

  return (
    <Screen>
      <AppHeader wallet={wallet} />

      {activeTab === 'ask' ? (
        askSurface === 'chat' ? (
          <ChatView
            chat={chat}
            getWalletSnapshot={wallet.getSnapshot}
            applyConfirmedTrade={wallet.applyConfirmedTrade}
            onLeaveChat={() => setAskSurface('home')}
          />
        ) : (
          <AskHome
            hasConversation={chat.messages.length > 0}
            onOpenChat={() => setAskSurface('chat')}
            onVoiceReply={handleVoiceReply}
            onVoiceTokens={handleVoiceTokens}
            getWalletSnapshot={wallet.getSnapshot}
            applyConfirmedTrade={wallet.applyConfirmedTrade}
          />
        )
      ) : null}
      {activeTab === 'markets' ? <MarketsView onAskDilo={askDilo} /> : null}
      {activeTab === 'wallet' ? (
        <WalletView wallet={wallet} onRestartOnboarding={handleRestartOnboarding} />
      ) : null}

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </Screen>
  )
}
