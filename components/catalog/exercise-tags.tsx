import { Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { CatalogExerciseDetail } from '@/types/catalog'
import { CATEGORY_LABELS, EQUIPMENT_LABELS } from '@/types/catalog'

interface ExerciseTagsProps {
  exercise: CatalogExerciseDetail
}

interface TagItem {
  label: string
  color?: string
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#eab308',
  expert: '#ef4444',
}

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const ExerciseTags = ({ exercise }: ExerciseTagsProps) => {
  const tags: TagItem[] = []

  if (exercise.category.length > 0) {
    tags.push({ label: CATEGORY_LABELS[exercise.category] ?? capitalize(exercise.category) })
  }

  if (exercise.force !== null) {
    tags.push({ label: capitalize(exercise.force) })
  }

  if (exercise.mechanic !== null) {
    tags.push({ label: capitalize(exercise.mechanic) })
  }

  if (exercise.equipment.length > 0) {
    const equipmentLabel = exercise.equipment
      .map((eq) => EQUIPMENT_LABELS[eq] ?? capitalize(eq))
      .join(', ')
    tags.push({ label: equipmentLabel })
  }

  if (exercise.level !== null) {
    tags.push({ label: capitalize(exercise.level), color: LEVEL_COLORS[exercise.level] })
  }

  if (tags.length === 0) return null

  return (
    <View className="flex-row flex-wrap gap-2">
      {tags.map((tag) => (
        <View key={tag.label} className="bg-background-tertiary rounded-full px-3 py-1.5">
          <Text
            className="text-xs font-inter-medium"
            style={{ color: tag.color ?? Colors.content.secondary }}
          >
            {tag.label}
          </Text>
        </View>
      ))}
    </View>
  )
}
