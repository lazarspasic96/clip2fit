import { useState, useSyncExternalStore } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogFloatingCta } from '@/components/catalog/catalog-floating-cta'
import { CardCarouselDesign } from '@/components/catalog/designs/card-carousel-design'
import { CatalogHeader } from '@/components/catalog/shared/catalog-header'
import { useWorkoutBuilder } from '@/contexts/workout-builder-context'
import { useCatalogInfinite } from '@/hooks/use-catalog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'
import { EMPTY_FILTERS } from '@/types/catalog'

const CTA_HEIGHT = 96

const ExerciseCatalogScreen = () => {
  const insets = useSafeAreaInsets()
  const builder = useWorkoutBuilder()
  const selectionVersion = useSyncExternalStore(builder.subscribe, builder.getSnapshot)
  const selectedCount = builder.getSelectedCount()

  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS)

  const debouncedSearch = useDebouncedValue(filters.search, 300)
  const activeFilters: CatalogFilters = { ...filters, search: debouncedSearch }
  const catalog = useCatalogInfinite(activeFilters)

  const handleToggle = (exercise: CatalogExercise) => {
    builder.toggleExercise(exercise)
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
