import { useCallback, useState } from 'react'

const storageKey = 'dilo.onboarding.v1'

function readHasCompleted(): boolean {
  try {
    return window.localStorage.getItem(storageKey) === 'done'
  } catch {
    return false
  }
}

function writeHasCompleted(hasCompleted: boolean): void {
  try {
    if (hasCompleted) {
      window.localStorage.setItem(storageKey, 'done')
      return
    }

    window.localStorage.removeItem(storageKey)
  } catch {
    // Storage is unavailable in private modes; onboarding stays session-only.
  }
}

export function useOnboarding() {
  const [hasCompleted, setHasCompleted] = useState(readHasCompleted)

  const complete = useCallback(() => {
    writeHasCompleted(true)
    setHasCompleted(true)
  }, [])

  const restart = useCallback(() => {
    writeHasCompleted(false)
    setHasCompleted(false)
  }, [])

  return { hasCompleted, complete, restart }
}
