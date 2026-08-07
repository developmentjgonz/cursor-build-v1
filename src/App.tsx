import { AnimatePresence } from 'motion/react'
import { useCallback, useState } from 'react'

import { AppHeader } from './components/app-shell/app-header'
import {
  BottomNavigation,
  type AppTab,
} from './components/app-shell/bottom-navigation'
import { Screen } from './components/ui/screen'
import { ChatView } from './features/chat/chat-view'
import { useDiloChat } from './features/chat/use-dilo-chat'
import { FundingFlow } from './features/funding/funding-flow'
import { MarketsView } from './features/markets/markets-view'
import { HowItWorksScreen } from './features/onboarding/how-it-works-screen'
import { useOnboarding } from './features/onboarding/use-onboarding'
import { WelcomeScreen } from './features/onboarding/welcome-screen'
import { useMockWallet } from './features/wallet/use-mock-wallet'
import { WalletView } from './features/wallet/wallet-view'

type OnboardingPhase = 'welcome' | 'how-it-works' | 'funding'

export function App() {
  const onboarding = useOnboarding()
  const wallet = useMockWallet()
  const chat = useDiloChat()
  const [phase, setPhase] = useState<OnboardingPhase>('welcome')
  const [activeTab, setActiveTab] = useState<AppTab>('ask')

  const askDilo = useCallback(
    (prompt: string) => {
      setActiveTab('ask')
      chat.sendMessage(prompt)
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

  const handleExistingWallet = useCallback(() => {
    wallet.connect()
    onboarding.complete()
  }, [onboarding, wallet])

  const handleRestartOnboarding = useCallback(() => {
    setPhase('welcome')
    onboarding.restart()
  }, [onboarding])

  if (!onboarding.hasCompleted) {
    return (
      <AnimatePresence mode="wait">
        {phase === 'welcome' ? (
          <WelcomeScreen
            key="welcome"
            onCreateWallet={() => setPhase('how-it-works')}
            onUseExistingWallet={handleExistingWallet}
          />
        ) : null}

        {phase === 'how-it-works' ? (
          <HowItWorksScreen
            key="how-it-works"
            onContinue={() => setPhase('funding')}
            onBack={() => setPhase('welcome')}
          />
        ) : null}

        {phase === 'funding' ? (
          <FundingFlow
            key="funding"
            onComplete={handleDeposit}
            onBack={() => setPhase('how-it-works')}
          />
        ) : null}
      </AnimatePresence>
    )
  }

  return (
    <Screen>
      <AppHeader wallet={wallet} />

      {activeTab === 'ask' ? <ChatView chat={chat} /> : null}
      {activeTab === 'markets' ? <MarketsView onAskDilo={askDilo} /> : null}
      {activeTab === 'wallet' ? (
        <WalletView wallet={wallet} onRestartOnboarding={handleRestartOnboarding} />
      ) : null}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </Screen>
  )
}
