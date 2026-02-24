import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WorkoutProposal } from '@/components/proposal/workout-proposal'
import { useConversion } from '@/contexts/conversion-context'

const WorkoutProposalScreen = () => {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>()
  const { clear } = useConversion()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleSaved = () => {
    clear()
    router.dismiss()
    router.navigate(`/(protected)/(tabs)/my-workouts?newWorkoutId=${workoutId}`)
  }

  const handleDiscard = () => {
    clear()
    router.dismiss()
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <WorkoutProposal workoutId={workoutId} onSaved={handleSaved} onDiscard={handleDiscard} />
    </View>
  )
}

export default WorkoutProposalScreen
