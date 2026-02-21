import { Text, View } from 'react-native'

import { ExerciseInstructions } from '@/components/catalog/exercise-instructions'
import { ExerciseMuscleGroups } from '@/components/catalog/exercise-muscle-groups'
import { ExerciseRelatedList } from '@/components/catalog/exercise-related-list'
import { ExerciseTags } from '@/components/catalog/exercise-tags'
import type { CatalogExerciseDetail } from '@/types/catalog'

interface ExerciseDetailContentProps {
  exercise: CatalogExerciseDetail
}

export const ExerciseDetailContent = ({ exercise }: ExerciseDetailContentProps) => {
  return (
    <View className="px-5 pt-4 gap-5 pb-4">
      {/* Name and aliases */}
      <View>
        <Text className="text-2xl font-onest text-content-primary">
          {exercise.name}
        </Text>
        {exercise.aliases.length > 0 && (
          <Text className="text-sm font-inter text-content-tertiary mt-1">
            Also: {exercise.aliases.join(', ')}
          </Text>
        )}
      </View>

      <ExerciseTags exercise={exercise} />

      <ExerciseMuscleGroups
        primary={exercise.primaryMuscleGroups}
        secondary={exercise.secondaryMuscleGroups}
      />

      <ExerciseInstructions instructions={exercise.instructions} />

      {/* Related list renders its own horizontal padding for the scroll */}
      <View className="-mx-5">
        <ExerciseRelatedList
          exerciseId={exercise.id}
          primaryMuscle={exercise.primaryMuscleGroups[0] ?? null}
        />
      </View>
    </View>
  )
}
