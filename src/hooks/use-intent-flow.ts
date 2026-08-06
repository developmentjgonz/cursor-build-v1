import { useState } from 'react'

import type { Intent } from '../../shared/contracts/intent'
import { interpretIntent } from '../lib/intent/intent-service'

export interface IntentFlowState {
  status: 'idle' | 'interpreting' | 'ready' | 'error'
  intent: Intent | null
  errorMessage: string | null
}

const initialState: IntentFlowState = {
  status: 'idle',
  intent: null,
  errorMessage: null,
}

export function useIntentFlow() {
  const [state, setState] = useState<IntentFlowState>(initialState)

  async function submitPrompt(
    prompt: string,
    walletAddress?: string,
  ): Promise<void> {
    setState({
      status: 'interpreting',
      intent: null,
      errorMessage: null,
    })

    try {
      const intent = await interpretIntent({ prompt, walletAddress })
      setState({
        status: 'ready',
        intent,
        errorMessage: null,
      })
    } catch (error) {
      setState({
        status: 'error',
        intent: null,
        errorMessage:
          error instanceof Error ? error.message : 'Unable to interpret intent',
      })
    }
  }

  function reset(): void {
    setState(initialState)
  }

  return {
    ...state,
    reset,
    submitPrompt,
  }
}
