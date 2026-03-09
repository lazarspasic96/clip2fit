import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { AlertCircle, Check, Dumbbell, RefreshCw, Sliders } from 'lucide-react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { CatalogActiveFilters } from '@/components/catalog/shared/catalog-active-filters'
import { CatalogEmptyState } from '@/components/catalog/shared/catalog-empty-state'
import { CatalogFilterChips } from '@/components/catalog/shared/catalog-filter-chips'
import { CatalogSearchBar } from '@/components/catalog/shared/catalog-search-bar'
import type { AddExercisesController } from '@/components/add-exercises/shared/use-add-exercises-controller'
import { Colors } from '@/constants/colors'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/types/catalog'

interface DesignBStackedFocusProps {
  controller: AddExercisesController
  bottomInset: number
  onOpenFilters: () => void
}

type FilterKey = 'muscle' | 'equipment' | 'difficulty' | 'category' | 'force' | 'mechanic'

const filterKeys: FilterKey[] = ['equipment', 'difficulty', 'category', 'force', 'mechanic']

const getResultLabel = (total: number, muscle: string | null, equipment: string | null, activeCount: number): string => {
  if (activeCount === 0) return `${total} exercises`

  if (activeCount === 1 && muscle !== null) {
    const label = MUSCLE_GROUP_LABELS[muscle]?.toLowerCase() ?? muscle
    return `${total} ${label} exercises`
  }

  if (activeCount === 1 && equipment !== null) {
    const label = EQUIPMENT_LABELS[equipment]?.toLowerCase() ?? equipment
    return `${total} ${label} exercises`
  }

  return `${total} results`
}

export const DesignBStackedFocus = ({ controller, bottomInset, onOpenFilters }: DesignBStackedFocusProps) => {
  const sheetFilterCount = filterKeys.filter((key) => controller.filters[key] !== null).length
  const hasAnyFilter =
    controller.filters.search.length > 0
    || controller.filters.muscle !== null
    || sheetFilterCount > 0

  const activeFilterCount =
    (controller.filters.search.length > 0 ? 1 : 0)
    + (controller.filters.muscle !== null ? 1 : 0)
    + sheetFilterCount

  const handleRemoveFilter = (key: FilterKey) => {
    controller.setFilters((prev) => ({ ...prev, [key]: null }))
  }

  const handleClearAll = () => {
    controller.setFilters((prev) => ({
      ...prev,
      muscle: null,
      bodyPart: null,
      equipment: null,
      difficulty: null,
      category: null,
      force: null,
      mechanic: null,
    }))
  }

  return (
    <View className="flex-1">
      <View className="px-5 pt-1 pb-2 gap-2">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <CatalogSearchBar
              value={controller.filters.search}
              onChangeText={(search) => controller.setFilters((prev) => ({ ...prev, search }))}
            />
          </View>
          <Pressable
            onPress={onOpenFilters}
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
                <Text className="text-[10px] font-inter-bold text-background-primary" style={{ fontVariant: ['tabular-nums'] }}>
                  {sheetFilterCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <CatalogFilterChips
          selectedMuscle={controller.filters.muscle}
          onSelectMuscle={(muscle) => controller.setFilters((prev) => ({ ...prev, muscle }))}
        />

        <CatalogActiveFilters
          filters={controller.filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        <Text className="text-xs font-inter text-content-tertiary px-0.5">
          {getResultLabel(controller.total, controller.filters.muscle, controller.filters.equipment, activeFilterCount)}
        </Text>
      </View>

      {controller.isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={Colors.content.tertiary} size="large" />
        </View>
      ) : controller.error !== null ? (
        <View className="flex-1 justify-center items-center px-10">
          <AlertCircle size={48} color={Colors.content.tertiary} />
          <Text className="text-base font-inter-semibold text-content-primary mt-4">Something went wrong</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1 text-center">{controller.error}</Text>
          <Pressable
            onPress={controller.refetch}
            className="flex-row items-center gap-2 mt-4 bg-background-tertiary rounded-xl px-5 py-2.5"
          >
            <RefreshCw size={16} color={Colors.content.primary} pointerEvents="none" />
            <Text className="text-sm font-inter-semibold text-content-primary">Retry</Text>
          </Pressable>
        </View>
      ) : controller.items.length === 0 ? (
        <CatalogEmptyState
          hasFilters={hasAnyFilter}
          filters={controller.filters}
          onRemoveFilter={handleRemoveFilter}
        />
      ) : (
        <FlashList
          data={controller.items}
          keyExtractor={(item) => item.id}
          extraData={controller.selectionVersion}
          onEndReached={() => {
            if (controller.hasNextPage) controller.fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          refreshing={controller.isRefetching}
          onRefresh={controller.refetch}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomInset + 8 }}
          renderItem={({ item }) => {
            const disabled = controller.isDisabled(item.id)
            const selected = controller.isSelected(item.id)
            const targetLabel = MUSCLE_GROUP_LABELS[item.target] ?? item.target
            const secondary = item.secondaryMuscles.slice(0, 2)

            return (
              <Pressable
                onPress={() => controller.toggleExercise(item)}
                className="mb-3 rounded-2xl border p-3 flex-row items-center gap-3"
                style={{
                  borderCurve: 'continuous',
                  borderColor: selected ? Colors.brand.accent : Colors.border.primary,
                  backgroundColor: disabled
                    ? 'rgba(24,24,27,0.7)'
                    : selected
                      ? 'rgba(132,204,22,0.09)'
                      : Colors.background.secondary,
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <View className="w-16 h-16 rounded-xl overflow-hidden bg-background-tertiary items-center justify-center">
                  {item.thumbnailUrl !== null ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <Dumbbell size={20} color={Colors.content.tertiary} pointerEvents="none" />
                  )}
                </View>

                <View className="flex-1 gap-1">
                  <Text className="text-base font-inter-semibold text-content-primary" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs font-inter text-content-secondary" numberOfLines={1}>
                    {targetLabel}
                    {secondary.length > 0 ? ` · ${secondary.join(', ')}` : ''}
                  </Text>
                  <Text className="text-xs font-inter text-content-tertiary" numberOfLines={1}>
                    {EQUIPMENT_LABELS[item.equipment] ?? item.equipment}
                  </Text>
                </View>

                <View
                  className="w-7 h-7 rounded-full items-center justify-center border"
                  style={{
                    borderColor: selected ? Colors.brand.accent : Colors.border.secondary,
                    backgroundColor: selected ? Colors.brand.accent : 'transparent',
                  }}
                >
                  {selected && <Check size={14} color={Colors.background.primary} pointerEvents="none" />}
                </View>
              </Pressable>
            )
          }}
          ListFooterComponent={
            controller.isFetchingNextPage
              ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color={Colors.content.tertiary} />
                </View>
                )
              : null
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
