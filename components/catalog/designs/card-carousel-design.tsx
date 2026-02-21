import { FlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import { AlertCircle, RefreshCw, Sliders } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { CardMotionPreview } from '@/components/catalog/designs/card-motion-preview'
import { CatalogActiveFilters } from '@/components/catalog/shared/catalog-active-filters'
import { CatalogEmptyState } from '@/components/catalog/shared/catalog-empty-state'
import { CatalogFilterChips } from '@/components/catalog/shared/catalog-filter-chips'
import { CatalogFilterSheet } from '@/components/catalog/shared/catalog-filter-sheet'
import { CatalogSearchBar } from '@/components/catalog/shared/catalog-search-bar'
import { Colors } from '@/constants/colors'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/types/catalog'

interface CatalogDesignProps {
  items: CatalogExercise[]
  total: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  error: string | null
  refetch: () => void
  isRefetching: boolean
  filters: CatalogFilters
  setFilters: (filters: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => void
  onToggle: (exercise: CatalogExercise) => void
  isSelected: (id: string) => boolean
  selectionVersion: number
  bottomInset?: number
}

const COLUMN_GAP = 12

const ItemSeparator = () => <View className="h-3" />

const ListFooter = ({ isFetchingNextPage }: { isFetchingNextPage: boolean }) => {
  if (!isFetchingNextPage) return <View className="h-6" />

  return (
    <View className="py-5 items-center">
      <ActivityIndicator color={Colors.content.tertiary} />
    </View>
  )
}

export const CardCarouselDesign = ({
  items,
  total,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
  refetch,
  isRefetching,
  filters,
  setFilters,
  onToggle,
  isSelected,
  selectionVersion,
  bottomInset,
}: CatalogDesignProps) => {
  const router = useRouter()
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  // Exclude muscle from badge count (shown inline as chips)
  const sheetFilterCount = [
    filters.equipment,
    filters.level,
    filters.category,
    filters.force,
    filters.mechanic,
  ].filter((v) => v !== null).length

  const hasAnyFilter =
    filters.search.length > 0 ||
    filters.muscle !== null ||
    sheetFilterCount > 0

  const handleSearchChange = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }))
  }

  const handleMuscleSelect = (muscle: string | null) => {
    setFilters((prev) => ({ ...prev, muscle }))
  }

  const handleRemoveFilter = (key: 'muscle' | 'equipment' | 'level' | 'category' | 'force' | 'mechanic') => {
    setFilters((prev) => ({ ...prev, [key]: null }))
  }

  const handleClearAll = () => {
    setFilters((prev) => ({
      ...prev,
      muscle: null,
      equipment: null,
      level: null,
      category: null,
      force: null,
      mechanic: null,
    }))
  }

  const handleFilterApply = (applied: CatalogFilters) => {
    setFilters(applied)
    setFilterSheetVisible(false)
  }

  const getResultLabel = (): string => {
    const activeCount =
      (filters.muscle !== null ? 1 : 0) + sheetFilterCount + (filters.search.length > 0 ? 1 : 0)

    if (activeCount === 0) return `${total} exercises`

    // Single muscle filter → "84 chest exercises"
    if (activeCount === 1 && filters.muscle !== null) {
      const label = MUSCLE_GROUP_LABELS[filters.muscle]?.toLowerCase() ?? filters.muscle
      return `${total} ${label} exercises`
    }

    // Single equipment filter → "170 barbell exercises"
    if (activeCount === 1 && filters.equipment !== null) {
      const label = EQUIPMENT_LABELS[filters.equipment]?.toLowerCase() ?? filters.equipment
      return `${total} ${label} exercises`
    }

    return `${total} results`
  }

  const handleEndReached = () => {
    if (hasNextPage) fetchNextPage()
  }

  const handleExerciseNavigate = (exercise: CatalogExercise) => {
    router.push(`/(protected)/exercise-detail?id=${exercise.id}`)
  }

  const renderItem = ({ item, index }: { item: CatalogExercise; index: number }) => {
    const isLeftColumn = index % 2 === 0

    return (
      <View
        style={{
          flex: 1,
          paddingRight: isLeftColumn ? COLUMN_GAP / 2 : 0,
          paddingLeft: isLeftColumn ? 0 : COLUMN_GAP / 2,
        }}
      >
        <CardMotionPreview
          exercise={item}
          onNavigate={() => handleExerciseNavigate(item)}
          onToggle={() => onToggle(item)}
          isSelected={isSelected(item.id)}
        />
      </View>
    )
  }

  return (
    <View className="flex-1">
      {/* Search + filter row */}
      <View className="flex-row items-center px-5 gap-2">
        <View className="flex-1">
          <CatalogSearchBar value={filters.search} onChangeText={handleSearchChange} />
        </View>

        <Pressable
          onPress={() => setFilterSheetVisible(true)}
          className="w-12 h-12 rounded-[14px] border bg-background-secondary items-center justify-center"
          style={{
            borderCurve: 'continuous',
            borderColor: sheetFilterCount > 0 ? Colors.brand.accent : Colors.border.primary,
          }}
        >
          <Sliders
            size={18}
            color={sheetFilterCount > 0 ? Colors.brand.accent : Colors.content.tertiary}
            pointerEvents="none"
          />
          {sheetFilterCount > 0 && (
            <View className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-brand-accent items-center justify-center">
              <Text
                className="text-[10px] font-inter-bold text-background-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {sheetFilterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Inline muscle chips */}
      <View className="mt-2.5">
        <CatalogFilterChips
          selectedMuscle={filters.muscle}
          onSelectMuscle={handleMuscleSelect}
        />
      </View>

      {/* Active filter pills */}
      {sheetFilterCount > 0 && (
        <View className="mt-2">
          <CatalogActiveFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </View>
      )}

      {/* Result count */}
      <View className="mt-2.5 px-5">
        <Text className="text-xs font-inter text-content-tertiary">
          {getResultLabel()}
        </Text>
      </View>

      <View className="flex-1 mt-3">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color={Colors.content.tertiary} size="large" />
          </View>
        ) : error !== null ? (
          <View className="flex-1 justify-center items-center px-10">
            <AlertCircle size={48} color={Colors.content.tertiary} />
            <Text className="text-base font-inter-semibold text-content-primary mt-4">
              Something went wrong
            </Text>
            <Text className="text-sm font-inter text-content-secondary mt-1 text-center">
              {error}
            </Text>
            <Pressable
              onPress={refetch}
              className="flex-row items-center gap-2 mt-4 bg-background-tertiary rounded-xl px-5 py-2.5"
            >
              <RefreshCw size={16} color={Colors.content.primary} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-primary">Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <CatalogEmptyState
            hasFilters={hasAnyFilter}
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
          />
        ) : (
          <FlashList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            extraData={selectionVersion}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomInset }}
            ItemSeparatorComponent={ItemSeparator}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<ListFooter isFetchingNextPage={isFetchingNextPage} />}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
      </View>

      <CatalogFilterSheet
        visible={filterSheetVisible}
        onDismiss={() => setFilterSheetVisible(false)}
        filters={filters}
        onApply={handleFilterApply}
      />
    </View>
  )
}
