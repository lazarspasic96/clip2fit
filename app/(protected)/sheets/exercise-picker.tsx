import { FlashList } from '@shopify/flash-list'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { PickerExerciseRow } from '@/components/catalog/picker-exercise-row'
import { CatalogFilterChips } from '@/components/catalog/shared/catalog-filter-chips'
import { CatalogSearchBar } from '@/components/catalog/shared/catalog-search-bar'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useCatalogInfinite } from '@/hooks/use-catalog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { exercisePickerStore } from '@/stores/exercise-picker-store'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'
import { EMPTY_FILTERS } from '@/types/catalog'

const ITEM_HEIGHT = 68

const ExercisePickerScreen = () => {
  const router = useRouter()
  const { existingIds } = useLocalSearchParams<{ existingIds?: string }>()

  const alreadyAddedIds = new Set(
    existingIds !== undefined && existingIds.length > 0 ? existingIds.split(',') : [],
  )

  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState<string | null>(null)
  const [selectedMap, setSelectedMap] = useState<Map<string, CatalogExercise>>(new Map())

  const debouncedSearch = useDebouncedValue(search, 300)

  const filters: CatalogFilters = {
    ...EMPTY_FILTERS,
    search: debouncedSearch,
    muscle,
  }

  const { items, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCatalogInfinite(filters)

  const handleToggle = (exercise: CatalogExercise) => {
    Haptics.selectionAsync()
    setSelectedMap((prev) => {
      const next = new Map(prev)
      if (next.has(exercise.id)) {
        next.delete(exercise.id)
      } else {
        next.set(exercise.id, exercise)
      }
      return next
    })
  }

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    exercisePickerStore.setSelections(Array.from(selectedMap.values()))
    router.back()
  }

  const handleEndReached = () => {
    if (hasNextPage === true && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const selectedCount = selectedMap.size

  return (
    <View className="flex-1 bg-background-secondary">
      <View className="pt-2 pb-3 px-5">
        <SheetTitle>Add Exercises</SheetTitle>
      </View>

      <View className="px-5 mb-3">
        <CatalogSearchBar value={search} onChangeText={setSearch} />
      </View>

      <View className="mb-3">
        <CatalogFilterChips selectedMuscle={muscle} onSelectMuscle={setMuscle} />
      </View>

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            estimatedItemSize={ITEM_HEIGHT}
            renderItem={({ item }) => (
              <PickerExerciseRow
                exercise={item}
                isSelected={selectedMap.has(item.id)}
                isAlreadyAdded={alreadyAddedIds.has(item.id)}
                onToggle={() => handleToggle(item)}
              />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-sm font-inter text-content-tertiary">No exercises found</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: selectedCount > 0 ? 80 : 16 }}
          />
        )}
      </View>

      {/* Floating CTA */}
      {selectedCount > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 16,
            paddingTop: 12,
          }}
        >
          <Pressable
            onPress={handleAdd}
            className="flex-row items-center justify-center rounded-2xl py-4 px-6"
            style={{
              backgroundColor: Colors.brand.accent,
              borderCurve: 'continuous',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                backgroundColor: Colors.background.primary,
                borderRadius: 10,
                minWidth: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 6,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter_700Bold',
                  color: Colors.brand.accent,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {selectedCount}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Inter_600SemiBold',
                color: Colors.background.primary,
                letterSpacing: -0.2,
              }}
            >
              Add Exercises
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  )
}

export default ExercisePickerScreen
