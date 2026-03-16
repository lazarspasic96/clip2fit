import { useState } from 'react'
import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'dev-settings' })

const KEY = 'timer-design'

export type TimerDesign = 'pulse-ticker' | 'orbit' | 'float-pill'

const DESIGNS: TimerDesign[] = ['pulse-ticker', 'orbit', 'float-pill']

export const getTimerDesign = (): TimerDesign => {
  const value = storage.getString(KEY) as TimerDesign | undefined
  if (value !== undefined && DESIGNS.includes(value)) return value
  return 'pulse-ticker'
}

export const setTimerDesign = (design: TimerDesign): void => {
  storage.set(KEY, design)
}

export const useTimerDesign = () => {
  const [design, setDesign] = useState<TimerDesign>(getTimerDesign)

  const switchDesign = (next: TimerDesign) => {
    setTimerDesign(next)
    setDesign(next)
  }

  return { design, switchDesign, designs: DESIGNS }
}
