import { Dumbbell, Layers, Signal } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { ExerciseInstructions } from '@/components/catalog/exercise-instructions'
import { ExerciseMuscleGroups } from '@/components/catalog/exercise-muscle-groups'
import { ExerciseRelatedList } from '@/components/catalog/exercise-related-list'
import { SectionDivider } from '@/components/ui/section-divider'
import type { CatalogExerciseDetail } from '@/types/catalog'
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_DISPLAY_LABELS,
} from '@/types/catalog'

import { ExerciseInfoHighlight } from './exercise-info-highlight'

interface ExerciseContentSectionProps {
  exercise: CatalogExerciseDetail
}

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const ExerciseContentSection = ({ exercise }: ExerciseContentSectionProps) => {
  const highlights = [
    exercise.equipment.length > 0 && {
      icon: Dumbbell,
      label: 'Equipment',
      value: EQUIPMENT_LABELS[exercise.equipment] ?? capitalize(exercise.equipment),
    },
    exercise.difficulty !== null && {
      icon: Signal,
      label: 'Difficulty',
      value: DIFFICULTY_DISPLAY_LABELS[exercise.difficulty] ?? capitalize(exercise.difficulty),
    },
    exercise.category.length > 0 && {
      icon: Layers,
      label: 'Category',
      value: CATEGORY_LABELS[exercise.category] ?? capitalize(exercise.category),
    },
  ].filter(Boolean) as { icon: typeof Layers; label: string; value: string }[]

  return (
    <View className="bg-background-primary rounded-t-4xl -mt-6 pt-6">
      {/* Name & aliases */}
      <View className="px-5 pb-4">
        <Text className="text-2xl font-onest text-content-primary capitalize">
          {exercise.name}
        </Text>
        {exercise.aliases.length > 0 && (
          <Text className="text-sm font-inter text-content-tertiary mt-1">
            Also: {exercise.aliases.join(', ')}
          </Text>
        )}
      </View>

      {/* Highlights row */}
      {highlights.length > 0 && (
        <>
          <SectionDivider />
          <View className="flex-row px-5">
            {highlights.map((item, index) => (
              <ExerciseInfoHighlight
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                hasDivider={index > 0}
              />
            ))}
          </View>
        </>
      )}

      {/* Muscle groups */}
      <SectionDivider />
      <View className="px-5 py-4">
        <ExerciseMuscleGroups
          target={exercise.target}
          secondaryMuscles={exercise.secondaryMuscles}
          bodyPart={exercise.bodyPart}
        />
      </View>

      {/* Description */}
      {exercise.description.length > 0 && (
        <>
          <SectionDivider />
          <View className="px-5 py-4">
            <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
              Description
            </Text>
            <Text className="text-sm font-inter text-content-secondary leading-5">
              {exercise.description}
            </Text>
          </View>
        </>
      )}

      {/* Instructions */}
      <SectionDivider />
      <View className="px-5 py-4">
        <ExerciseInstructions instructions={exercise.instructions} />
      </View>

      {/* Related exercises */}
      <SectionDivider />
      <View className="py-4">
        <ExerciseRelatedList
          exerciseId={exercise.id}
          primaryMuscle={exercise.target}
        />
      </View>
    </View>
  )
}
