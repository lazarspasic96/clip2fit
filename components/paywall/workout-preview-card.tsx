import { Colors } from '@/constants/colors'
import { useWorkoutQuery } from '@/hooks/use-api'
import { Lock } from 'lucide-react-native'
import { Text, View } from 'react-native'

const FALLBACK_TITLE = 'Push Day — Jeff Nippard'
const FALLBACK_EXERCISES = [
  { name: 'Barbell Bench Press', sets: '4 x 8' },
  { name: 'Incline DB Press', sets: '3 x 10' },
  { name: 'Cable Fly', sets: '3 x 12' },
  { name: 'Lateral Raise', sets: '4 x 15' },
  { name: 'Tricep Pushdown', sets: '3 x 12' },
]
const FALLBACK_COUNT = 8

const formatSets = (sets: { targetReps: string | null }[]): string => {
  const reps = sets[0]?.targetReps
  return reps !== null && reps !== undefined ? `${sets.length} x ${reps}` : `${sets.length} sets`
}

interface WorkoutPreviewCardProps {
  workoutId?: string
}

export const WorkoutPreviewCard = ({ workoutId }: WorkoutPreviewCardProps) => {
  const { workout } = useWorkoutQuery(workoutId ?? null)

  const hasRealData = workout !== null
  const title = hasRealData ? workout.title : FALLBACK_TITLE
  const exerciseCount = hasRealData ? workout.exercises.length : FALLBACK_COUNT

  const exercises = hasRealData
    ? workout.exercises
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((ex) => ({ name: ex.name, sets: formatSets(ex.sets) }))
    : FALLBACK_EXERCISES

  const visibleCount = Math.min(3, exercises.length)
  const visible = exercises.slice(0, visibleCount)
  const locked = exercises.slice(visibleCount, visibleCount + 2)

  return (
    <View className="bg-background-secondary border border-border-primary rounded-2xl overflow-hidden">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3.5 border-b border-border-primary">
        <Text className="text-sm font-inter-semibold text-content-primary flex-1 mr-2" numberOfLines={1}>
          {title}
        </Text>
        <View style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.brand.accent }}>
            {exerciseCount} exercises
          </Text>
        </View>
      </View>

      {/* Exercise list */}
      <View className="px-4 py-1">
        {visible.map((ex, i) => (
          <View
            key={`${ex.name}-${i}`}
            className="flex-row justify-between items-center py-2.5"
            style={i < visible.length - 1 ? { borderBottomWidth: 1, borderBottomColor: 'rgba(39, 39, 42, 0.5)' } : undefined}
          >
            <Text className="text-[13px] font-inter text-content-secondary">{ex.name}</Text>
            <Text className="text-xs font-inter-medium text-content-tertiary">{ex.sets}</Text>
          </View>
        ))}

        {/* Locked/blurred exercises */}
        {locked.length > 0 && (
          <View style={{ opacity: 0.3 }}>
            {locked.map((ex, i) => (
              <View
                key={`${ex.name}-${i}`}
                className="flex-row justify-between items-center py-2.5"
              >
                <Text className="text-[13px] font-inter text-content-secondary">{ex.name}</Text>
                <Text className="text-xs font-inter-medium text-content-tertiary">{ex.sets}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row items-center gap-1.5 px-4 pb-3.5">
        <Lock size={12} color={Colors.brand.accent} pointerEvents="none" />
        <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.brand.accent }}>
          Unlock Pro for unlimited conversions
        </Text>
      </View>
    </View>
  )
}
