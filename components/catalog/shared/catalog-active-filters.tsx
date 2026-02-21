import { X } from 'lucide-react-native'
import { Pressable, ScrollView, Text } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'
import type { CatalogFilters } from '@/types/catalog'
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  FORCE_DISPLAY_LABELS,
  LEVEL_DISPLAY_LABELS,
  MECHANIC_DISPLAY_LABELS,
  MUSCLE_GROUP_LABELS,
} from '@/types/catalog'

type FilterKey = 'muscle' | 'equipment' | 'level' | 'category' | 'force' | 'mechanic'

const LABEL_MAPS: Record<FilterKey, Record<string, string>> = {
  muscle: MUSCLE_GROUP_LABELS,
  equipment: EQUIPMENT_LABELS,
  level: LEVEL_DISPLAY_LABELS,
  category: CATEGORY_LABELS,
  force: FORCE_DISPLAY_LABELS,
  mechanic: MECHANIC_DISPLAY_LABELS,
}

const PILL_KEYS: FilterKey[] = ['equipment', 'level', 'category', 'force', 'mechanic']

interface CatalogActiveFiltersProps {
  filters: CatalogFilters
  onRemoveFilter: (key: FilterKey) => void
  onClearAll: () => void
}

export const CatalogActiveFilters = ({
  filters,
  onRemoveFilter,
  onClearAll,
}: CatalogActiveFiltersProps) => {
  const activePills = PILL_KEYS.filter((key) => filters[key] !== null)
  const hasMuscle = filters.muscle !== null

  if (activePills.length === 0 && !hasMuscle) return null

  // Only show pills for non-muscle sheet filters
  if (activePills.length === 0) return null

  return (
    <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.duration(200)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
      >
        {activePills.map((key) => {
          const value = filters[key]
          if (value === null) return null
          const label = LABEL_MAPS[key][value] ?? value

          return (
            <Animated.View
              key={key}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(200)}
            >
              <Pressable
                onPress={() => onRemoveFilter(key)}
                className="flex-row items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-background-tertiary border border-brand-accent"
              >
                <Text className="text-xs font-inter-semibold text-brand-accent">
                  {label}
                </Text>
                <X size={12} color={Colors.brand.accent} pointerEvents="none" />
              </Pressable>
            </Animated.View>
          )
        })}

        <Pressable onPress={onClearAll} className="px-2 py-1.5">
          <Text className="text-xs font-inter-semibold text-content-tertiary">
            Clear all
          </Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  )
}
