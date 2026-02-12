import { Text } from 'react-native'

interface PreviousPerformanceProps {
  weight: number | null
  reps: number | null
  isBodyweight: boolean
}

export const PreviousPerformance = ({ weight, reps, isBodyweight }: PreviousPerformanceProps) => {
  if (reps === null) return null

  const label = isBodyweight ? `BW x ${reps}` : `${weight}kg x ${reps}`

  return <Text className="text-xs font-inter text-content-tertiary italic">{label}</Text>
}
