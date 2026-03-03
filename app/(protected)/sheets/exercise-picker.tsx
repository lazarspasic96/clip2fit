import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useSyncExternalStore } from 'react'
import { View } from 'react-native'

import { CatalogFloatingCta } from '@/components/catalog/catalog-floating-cta'
import { CardCarouselDesign } from '@/components/catalog/designs/card-carousel-design'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useCatalogInfinite } from '@/hooks/use-catalog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { usePickerSelection } from '@/hooks/use-picker-selection'
import { exercisePickerStore } from '@/stores/exercise-picker-store'
import { pickerFilterStore } from '@/stores/picker-filter-store'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'

const CTA_HEIGHT = 96

const ExercisePickerScreen = () => {
  const router = useRouter()

  const request = exercisePickerStore.getRequest()
  const existingIdSet = request?.existingIds ?? new Set<string>()

  const selection = usePickerSelection(existingIdSet)
  const selectionVersion = useSyncExternalStore(selection.subscribe, selection.getSnapshot)
  const selectedCount = selection.getSelectedCount()

  const filters = useSyncExternalStore(pickerFilterStore.subscribe, pickerFilterStore.getFilters)
  const debouncedSearch = useDebouncedValue(filters.search, 300)
  const activeFilters: CatalogFilters = { ...filters, search: debouncedSearch }
  const catalog = useCatalogInfinite(activeFilters)

  const handleToggle = (exercise: CatalogExercise) => {
    selection.toggleExercise(exercise)
  }

  const setFilters = (next: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => {
    if (typeof next === 'function') {
      pickerFilterStore.setFilters(next(pickerFilterStore.getFilters()))
    } else {
      pickerFilterStore.setFilters(next)
    }
  }

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    exercisePickerStore.respond(selection.getSelected())
    router.back()
  }

  return (
    <View className="flex-1 bg-background-secondary">
      <View className="pt-2 pb-3 px-5">
        <SheetTitle>Add Exercises</SheetTitle>
      </View>

      <CardCarouselDesign
        items={catalog.items}
        total={catalog.total}
        isLoading={catalog.isLoading}
        isFetchingNextPage={catalog.isFetchingNextPage}
        hasNextPage={catalog.hasNextPage}
        fetchNextPage={catalog.fetchNextPage}
        error={catalog.error}
        refetch={catalog.refetch}
        isRefetching={catalog.isRefetching}
        filters={filters}
        setFilters={setFilters}
        onToggle={handleToggle}
        isSelected={selection.isSelected}
        isDisabled={selection.isDisabled}
        selectionVersion={selectionVersion}
        bottomInset={selectedCount > 0 ? CTA_HEIGHT : 0}
        hideFilterButton
        navigationDisabled
      />

      <CatalogFloatingCta
        selectedCount={selectedCount}
        label="Add to Workout"
        onPress={handleAdd}
      />
    </View>
  )
}

export default ExercisePickerScreen
