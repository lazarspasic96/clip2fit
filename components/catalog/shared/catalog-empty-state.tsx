import { SearchX } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

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

const FILTER_KEYS: FilterKey[] = ['muscle', 'equipment', 'level', 'category', 'force', 'mechanic']

const getActiveFilterLabels = (filters: CatalogFilters): { key: FilterKey; label: string }[] => {
  return FILTER_KEYS.filter((key) => filters[key] !== null).map((key) => {
    const value = filters[key] as string
    const label = LABEL_MAPS[key][value] ?? value
    return { key, label }
  })
}

interface CatalogEmptyStateProps {
  hasFilters: boolean
  filters?: CatalogFilters
  onRemoveFilter?: (key: FilterKey) => void
}

export const CatalogEmptyState = ({
  hasFilters,
  filters,
  onRemoveFilter,
}: CatalogEmptyStateProps) => {
  const activeLabels = filters !== undefined ? getActiveFilterLabels(filters) : []
  const hasSearch = filters !== undefined && filters.search.length > 0

  const description = (() => {
    if (!hasFilters) return 'Something went wrong'

    if (activeLabels.length === 0 && hasSearch) return `No results for "${filters.search}"`

    if (activeLabels.length > 0) {
      const names = activeLabels.map((f) => f.label.toLowerCase())
      return `No exercises for ${names.join(' + ')}`
    }

    return 'Try adjusting your filters or search term'
  })()

  // Suggest removing each active filter
  const suggestions = activeLabels.slice(0, 3)

  return (
    <View className="flex-1 justify-center items-center px-10">
      <SearchX size={48} color={Colors.content.tertiary} />
      <Text className="text-base font-inter-semibold text-content-primary mt-4">
        No exercises found
      </Text>
      <Text className="text-sm font-inter text-content-secondary mt-1 text-center">
        {description}
      </Text>

      {suggestions.length > 0 && onRemoveFilter !== undefined && (
        <View className="mt-4 gap-2">
          <Text className="text-xs font-inter text-content-tertiary text-center">
            Try removing:
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {suggestions.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => onRemoveFilter(key)}
                className="px-3.5 py-1.5 rounded-full bg-background-tertiary border border-border-secondary"
              >
                <Text className="text-[13px] font-inter-semibold text-content-primary">
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
