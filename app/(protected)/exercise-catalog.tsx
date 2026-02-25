import { useSyncExternalStore } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogFloatingCta } from '@/components/catalog/catalog-floating-cta'
import { CardCarouselDesign } from '@/components/catalog/designs/card-carousel-design'
import { CatalogHeader } from '@/components/catalog/shared/catalog-header'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'
import { useCatalogInfinite } from '@/hooks/use-catalog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { catalogFilterStore } from '@/stores/catalog-filter-store'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'

const CTA_HEIGHT = 96

const ExerciseCatalogScreen = () => {
  const insets = useSafeAreaInsets()
  const builder = useWorkoutBuilder()
  const selectionVersion = useSyncExternalStore(builder.subscribe, builder.getSnapshot)
  const selectedCount = builder.getSelectedCount()

  // Subscribe to catalog filter store — getFilters is the snapshot so the
  // React Compiler treats `filters` as a reactive value (prevents stale memoization).
  const filters = useSyncExternalStore(catalogFilterStore.subscribe, catalogFilterStore.getFilters)

  const debouncedSearch = useDebouncedValue(filters.search, 300)
  const activeFilters: CatalogFilters = { ...filters, search: debouncedSearch }
  const catalog = useCatalogInfinite(activeFilters)

  const handleToggle = (exercise: CatalogExercise) => {
    builder.toggleExercise(exercise)
  }

  const setFilters = (next: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => {
    if (typeof next === 'function') {
      catalogFilterStore.setFilters(next(catalogFilterStore.getFilters()))
    } else {
      catalogFilterStore.setFilters(next)
    }
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <CatalogHeader />
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
        isSelected={builder.isSelected}
        selectionVersion={selectionVersion}
        bottomInset={selectedCount > 0 ? CTA_HEIGHT : 0}
      />
      <CatalogFloatingCta selectedCount={selectedCount} />
    </View>
  )
}

export default ExerciseCatalogScreen
