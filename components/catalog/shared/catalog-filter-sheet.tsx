import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native'

import { FilterChipGrid } from '@/components/catalog/shared/filter-chip-grid'
import { FilterSegmentedRow } from '@/components/catalog/shared/filter-segmented-row'
import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import type { CatalogFilters, CatalogForce, CatalogLevel, CatalogMechanic, FilterPresetDef } from '@/types/catalog'
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  FILTER_PRESETS,
  FORCE_DISPLAY_LABELS,
  LEVEL_DISPLAY_LABELS,
  MECHANIC_DISPLAY_LABELS,
  MUSCLE_GROUPS_ORDERED,
  MUSCLE_GROUP_LABELS,
} from '@/types/catalog'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MAX_SNAP = Math.round(SCREEN_HEIGHT * 0.8)

// --- Muscle region definitions ---

type RegionTab = 'all' | 'upper' | 'lower' | 'core'

const REGION_TAB_LABELS: Record<RegionTab, string> = {
  all: 'All',
  upper: 'Upper',
  lower: 'Lower',
  core: 'Core',
}

const REGION_MUSCLES: Record<RegionTab, readonly string[]> = {
  all: MUSCLE_GROUPS_ORDERED,
  upper: ['chest', 'shoulders', 'lats', 'middle_back', 'traps', 'lower_back', 'biceps', 'triceps', 'forearms'],
  lower: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abductors', 'adductors'],
  core: ['abdominals', 'neck'],
}

const REGION_TABS: RegionTab[] = ['all', 'upper', 'lower', 'core']

// --- Filter option constants ---

const LEVEL_OPTIONS: CatalogLevel[] = ['beginner', 'intermediate', 'expert']
const LEVEL_DOT_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#facc15',
  expert: '#f87171',
}

const FORCE_OPTIONS: CatalogForce[] = ['push', 'pull', 'static']
const MECHANIC_OPTIONS: CatalogMechanic[] = ['compound', 'isolation']

// --- Gym-split presets ---

const presetMatchesState = (
  preset: FilterPresetDef,
  state: Pick<CatalogFilters, 'muscle' | 'equipment' | 'level' | 'force' | 'mechanic' | 'category'>,
): boolean => {
  const entries = Object.entries(preset.filters) as [string, string][]
  return entries.every(([key, val]) => state[key as keyof typeof state] === val)
}

// --- Component ---

interface CatalogFilterSheetProps {
  visible: boolean
  onDismiss: () => void
  filters: CatalogFilters
  onApply: (filters: CatalogFilters) => void
}

export const CatalogFilterSheet = ({
  visible,
  onDismiss,
  filters,
  onApply,
}: CatalogFilterSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const [muscle, setMuscle] = useState<string | null>(filters.muscle)
  const [equipment, setEquipment] = useState<string | null>(filters.equipment)
  const [level, setLevel] = useState<CatalogLevel | null>(filters.level)
  const [force, setForce] = useState<CatalogForce | null>(filters.force)
  const [mechanic, setMechanic] = useState<CatalogMechanic | null>(filters.mechanic)
  const [category, setCategory] = useState<string | null>(filters.category)
  const [regionTab, setRegionTab] = useState<RegionTab>('all')

  useEffect(() => {
    if (visible) {
      setMuscle(filters.muscle)
      setEquipment(filters.equipment)
      setLevel(filters.level)
      setForce(filters.force)
      setMechanic(filters.mechanic)
      setCategory(filters.category)
      setRegionTab('all')
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible, filters])

  const currentState = { muscle, equipment, level, force, mechanic, category }

  const handleApply = () => {
    onApply({ ...filters, muscle, equipment, level, force, mechanic, category })
  }

  const handleClearAll = () => {
    setMuscle(null)
    setEquipment(null)
    setLevel(null)
    setForce(null)
    setMechanic(null)
    setCategory(null)
  }

  const handlePreset = (preset: FilterPresetDef) => {
    handleClearAll()
    if (preset.filters.muscle !== undefined) setMuscle(preset.filters.muscle)
    if (preset.filters.equipment !== undefined) setEquipment(preset.filters.equipment)
    if (preset.filters.force !== undefined) setForce(preset.filters.force as CatalogForce)
    if (preset.filters.category !== undefined) setCategory(preset.filters.category)
    if (preset.filters.level !== undefined) setLevel(preset.filters.level as CatalogLevel)
    if (preset.filters.mechanic !== undefined) setMechanic(preset.filters.mechanic as CatalogMechanic)
  }

  const toggleValue = <T extends string>(
    current: T | null,
    value: T,
    setter: (v: T | null) => void,
  ) => {
    setter(current === value ? null : value)
  }

  const visibleMuscles = REGION_MUSCLES[regionTab]

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      maxDynamicContentSize={MAX_SNAP}
      enablePanDownToClose
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.6}
          pressBehavior="close"
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}
      >
        <Text className="text-lg font-inter-bold text-content-primary mb-5">Filters</Text>

        {/* Gym-split presets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 20 }}
        >
          {FILTER_PRESETS.map((preset) => {
            const isActive = presetMatchesState(preset, currentState)

            return (
              <Pressable
                key={preset.label}
                onPress={() => handlePreset(preset)}
                className={cn(
                  'rounded-full px-4 py-2 border',
                  isActive
                    ? 'border-brand-accent bg-background-tertiary'
                    : 'border-border-primary bg-background-tertiary',
                )}
              >
                <Text
                  className={cn(
                    'text-sm',
                    isActive
                      ? 'font-inter-semibold text-brand-accent'
                      : 'font-inter text-content-secondary',
                  )}
                >
                  {preset.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Muscle Group */}
        <SectionLabel text="Muscle Group" />
        <View className="flex-row gap-1.5 mb-3">
          {REGION_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setRegionTab(tab)}
              className={cn(
                'rounded-full px-3 py-1',
                regionTab === tab ? 'bg-brand-accent' : 'bg-background-tertiary',
              )}
            >
              <Text
                className={cn(
                  'text-xs',
                  regionTab === tab
                    ? 'font-inter-semibold text-background-primary'
                    : 'font-inter text-content-tertiary',
                )}
              >
                {REGION_TAB_LABELS[tab]}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mb-5">
          <FilterChipGrid
            options={visibleMuscles}
            labels={MUSCLE_GROUP_LABELS}
            selected={muscle}
            onToggle={(v) => toggleValue(muscle, v, setMuscle)}
          />
        </View>

        {/* Level */}
        <SectionLabel text="Level" />
        <View className="mb-5">
          <FilterSegmentedRow
            options={LEVEL_OPTIONS}
            labels={LEVEL_DISPLAY_LABELS}
            selected={level}
            onToggle={(v) => toggleValue(level, v as CatalogLevel, setLevel)}
            dotColors={LEVEL_DOT_COLORS}
          />
        </View>

        {/* Movement Type (was Force) */}
        <SectionLabel text="Movement Type" />
        <View className="mb-5">
          <FilterSegmentedRow
            options={FORCE_OPTIONS}
            labels={FORCE_DISPLAY_LABELS}
            selected={force}
            onToggle={(v) => toggleValue(force, v as CatalogForce, setForce)}
          />
        </View>

        {/* Mechanic */}
        <SectionLabel text="Mechanic" />
        <View className="mb-5">
          <FilterSegmentedRow
            options={MECHANIC_OPTIONS}
            labels={MECHANIC_DISPLAY_LABELS}
            selected={mechanic}
            onToggle={(v) => toggleValue(mechanic, v as CatalogMechanic, setMechanic)}
          />
        </View>

        {/* Category */}
        <SectionLabel text="Category" />
        <View className="mb-6">
          <FilterChipGrid
            options={CATEGORY_OPTIONS}
            labels={CATEGORY_LABELS}
            selected={category}
            onToggle={(v) => toggleValue(category, v, setCategory)}
          />
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3">
          <Pressable onPress={handleClearAll} className="flex-1 rounded-xl py-3 items-center">
            <Text className="text-sm font-inter-semibold text-content-secondary">Clear All</Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            className="flex-1 rounded-xl py-3 bg-brand-accent items-center"
          >
            <Text className="text-sm font-inter-semibold text-background-primary">
              Show Exercises
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
}

const SectionLabel = ({ text }: { text: string }) => (
  <Text className="text-xs font-inter-semibold text-content-tertiary uppercase tracking-wider mb-2">
    {text}
  </Text>
)
