import * as Speech from 'expo-speech'
import { useRef, useState } from 'react'
import { createMMKV } from 'react-native-mmkv'

import type { FormIssue, FormSeverity } from '@/types/form-rules'

const storage = createMMKV({ id: 'form-coach' })
const MUTE_KEY = 'form-coach-tts-muted'

const THROTTLE_MS: Record<FormSeverity, number> = {
  error: 3000,
  warning: 5000,
  good: Infinity,
}

const GLOBAL_THROTTLE_MS = 2000

export const useTtsFeedback = () => {
  const [isMuted, setIsMuted] = useState(() => storage.getBoolean(MUTE_KEY) === true)
  const lastSpokePerSeverity = useRef<Record<FormSeverity, number>>({
    error: 0,
    warning: 0,
    good: 0,
  })
  const lastSpokeAt = useRef(0)
  const goodRepStreak = useRef(0)

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    storage.set(MUTE_KEY, next)
    if (next) Speech.stop()
  }

  const canSpeakGlobally = (): boolean => {
    return Date.now() - lastSpokeAt.current >= GLOBAL_THROTTLE_MS
  }

  const markSpoken = () => {
    lastSpokeAt.current = Date.now()
  }

  const speakIssue = (issue: FormIssue) => {
    if (isMuted) return
    if (issue.severity === 'good') return
    if (!canSpeakGlobally()) return

    const now = Date.now()
    const throttle = THROTTLE_MS[issue.severity]
    if (now - lastSpokePerSeverity.current[issue.severity] < throttle) return

    const text = issue.spokenMessage ?? issue.message
    Speech.stop()
    Speech.speak(text, { rate: 1.1, language: 'en-US' })
    lastSpokePerSeverity.current[issue.severity] = now
    markSpoken()
  }

  const speakMessage = async (text: string) => {
    if (isMuted) return

    // Don't interrupt an ongoing utterance
    const isSpeaking = await Speech.isSpeakingAsync()
    if (isSpeaking) return

    // Only speak coaching if nothing has spoken in 4s
    if (Date.now() - lastSpokeAt.current < 4000) return

    Speech.speak(text, { rate: 1.1, language: 'en-US' })
    markSpoken()
  }

  const speakRepFeedback = (severity: FormSeverity) => {
    if (isMuted) return
    if (!canSpeakGlobally()) return

    if (severity === 'good') {
      goodRepStreak.current += 1
      // Only speak "Good" every 3rd consecutive good rep
      if (goodRepStreak.current % 3 !== 0) return
      Speech.stop()
      Speech.speak('Good', { rate: 1.1, language: 'en-US' })
    } else {
      goodRepStreak.current = 0
      const msg = severity === 'error' ? 'Fix that' : 'Watch form'
      Speech.stop()
      Speech.speak(msg, { rate: 1.1, language: 'en-US' })
    }
    markSpoken()
  }

  return { isMuted, toggleMute, speakIssue, speakMessage, speakRepFeedback }
}
