import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

import { ActiveWorkoutContent } from '@/components/workout/active-workout-content'
import { ActiveWorkoutProvider } from '@/contexts/active-workout-context'

const ActiveWorkoutScreen = () => (
  <BottomSheetModalProvider>
    <ActiveWorkoutProvider>
      <ActiveWorkoutContent />
    </ActiveWorkoutProvider>
  </BottomSheetModalProvider>
)

export default ActiveWorkoutScreen
