import type { ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { AlertCircle, RefreshCw, Sliders } from 'lucide-react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { CatalogActiveFilters } from '@/components/catalog/shared/catalog-active-filters'
import { CatalogEmptyState } from '@/components/catalog/shared/catalog-empty-state'
import { CatalogFilterChips } from '@/components/catalog/shared/catalog-filter-chips'
import { CatalogSearchBar } from '@/components/catalog/shared/catalog-search-bar'
import { Colors } from '@/constants/colors'
import type { CatalogDesignProps } from '@/types/catalog'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/types/catalog'

type FilterKey = 'muscle' | 'equipment' | 'difficulty' | 'category' | 'force' | 'mechanic'

const SHEET_FILTER_KEYS: FilterKey[] = ['equipment', 'difficulty', 'category', 'force', 'mechanic']

interface CatalogDesignShellProps extends CatalogDesignProps {
  renderList: () => ReactNode
}

const getResultLabel = (total: number, filters: CatalogDesignProps['filters']): string => {
  const sheetCount = SHEET_FILTER_KEYS.filter((k) => filters[k] !== null).length
  const activeCount = (filters.muscle !== null ? 1 : 0) + sheetCount + (filters.search.length > 0 ? 1 : 0)

  if (activeCount === 0) return `${total} exercises`

  if (activeCount === 1 && filters.muscle !== null) {
    const label = MUSCLE_GROUP_LABELS[filters.muscle]?.toLowerCase() ?? filters.muscle
    return `${total} ${label} exercises`
  }

  if (activeCount === 1 && filters.equipment !== null) {
    const label = EQUIPMENT_LABELS[filters.equipment]?.toLowerCase() ?? filters.equipment
    return `${total} ${label} exercises`
  }

  return `${total} results`
}

export const CatalogDesignShell = ({
  items,
  total,
  isLoading,
  error,
  refetch,
  filters,
  setFilters,
  filterSheetRoute = '/(protected)/sheets/catalog-filters',
  hideFilterButton = false,
  renderList,
}: CatalogDesignShellProps) => {
  const router = useRouter()
  const sheetFilterCount = SHEET_FILTER_KEYS.filter((k) => filters[k] !== null).length
  const hasAnyFilter = filters.search.length > 0 || filters.muscle !== null || sheetFilterCount > 0

  const handleSearchChange = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text }))
  }

  const handleMuscleSelect = (muscle: string | null) => {
    setFilters((prev) => ({ ...prev, muscle }))
  }

  const handleRemoveFilter = (key: FilterKey) => {
    setFilters((prev) => ({ ...prev, [key]: null }))
  }

  const handleClearAll = () => {
    setFilters((prev) => ({
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
      {/* Search + filter row */}
      <View className={hideFilterButton ? 'px-5' : 'flex-row items-center px-5 gap-2'}>
        <View className={hideFilterButton ? undefined : 'flex-1'}>
          <CatalogSearchBar value={filters.search} onChangeText={handleSearchChange} />
        </View>

        {!hideFilterButton && (
          <Pressable
            onPress={() => router.push(filterSheetRoute as never)}
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
        )}
      </View>

      <View className="mt-2.5">
        <CatalogFilterChips selectedMuscle={filters.muscle} onSelectMuscle={handleMuscleSelect} />
      </View>

      {!hideFilterButton && sheetFilterCount > 0 && (
        <View className="mt-2">
          <CatalogActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
        </View>
      )}

      <View className="mt-2.5 px-5">
        <Text className="text-xs font-inter text-content-tertiary">{getResultLabel(total, filters)}</Text>
      </View>

      <View className="flex-1 mt-3">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color={Colors.content.tertiary} size="large" />
          </View>
        ) : error !== null ? (
          <View className="flex-1 justify-center items-center px-10">
            <AlertCircle size={48} color={Colors.content.tertiary} />
            <Text className="text-base font-inter-semibold text-content-primary mt-4">Something went wrong</Text>
            <Text className="text-sm font-inter text-content-secondary mt-1 text-center">{error}</Text>
            <Pressable
              onPress={refetch}
              className="flex-row items-center gap-2 mt-4 bg-background-tertiary rounded-xl px-5 py-2.5"
            >
              <RefreshCw size={16} color={Colors.content.primary} pointerEvents="none" />
              <Text className="text-sm font-inter-semibold text-content-primary">Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <CatalogEmptyState hasFilters={hasAnyFilter} filters={filters} onRemoveFilter={handleRemoveFilter} />
        ) : (
          renderList()
        )}
      </View>
    </View>
  )
}
