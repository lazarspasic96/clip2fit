import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { FilterChipGrid } from '@/components/catalog/shared/filter-chip-grid'
import { FilterSegmentedRow } from '@/components/catalog/shared/filter-segmented-row'
import { cn } from '@/components/ui/cn'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { pickerFilterStore } from '@/stores/picker-filter-store'
import type { CatalogDifficulty, CatalogFilters, CatalogForce, CatalogMechanic, FilterPresetDef } from '@/types/catalog'
import {
  DIFFICULTY_DISPLAY_LABELS,
  FILTER_PRESETS,
  FORCE_DISPLAY_LABELS,
  MECHANIC_DISPLAY_LABELS,
  MUSCLE_GROUPS_ORDERED,
  MUSCLE_GROUP_LABELS,
} from '@/types/catalog'

type RegionTab = 'all' | 'upper' | 'lower' | 'core'

const REGION_TAB_LABELS: Record<RegionTab, string> = {
  all: 'All',
  upper: 'Upper',
  lower: 'Lower',
  core: 'Core',
}

const REGION_MUSCLES: Record<RegionTab, readonly string[]> = {
  all: MUSCLE_GROUPS_ORDERED,
  upper: ['pectorals', 'delts', 'lats', 'upper back', 'traps', 'spine', 'biceps', 'triceps', 'forearms'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves', 'abductors', 'adductors'],
  core: ['abs', 'serratus anterior'],
}

const REGION_TABS: RegionTab[] = ['all', 'upper', 'lower', 'core']
const DIFFICULTY_OPTIONS: CatalogDifficulty[] = ['beginner', 'intermediate', 'advanced']
const FORCE_OPTIONS: CatalogForce[] = ['push', 'pull', 'static']
const MECHANIC_OPTIONS: CatalogMechanic[] = ['compound', 'isolation']

const presetMatchesState = (
  preset: FilterPresetDef,
  state: Pick<CatalogFilters, 'muscle' | 'equipment' | 'difficulty' | 'force' | 'mechanic' | 'category'>,
): boolean => {
  const entries = Object.entries(preset.filters) as [string, string][]
  return entries.every(([key, val]) => state[key as keyof typeof state] === val)
}

const SectionLabel = ({ text }: { text: string }) => (
  <Text className="text-xs font-inter-semibold text-content-tertiary uppercase tracking-wider mb-2">
    {text}
  </Text>
)

const PickerFiltersScreen = () => {
  const router = useRouter()
  const initial = pickerFilterStore.getFilters()

  const [muscle, setMuscle] = useState<string | null>(initial.muscle)
  const [equipment, setEquipment] = useState<string | null>(initial.equipment)
  const [difficulty, setDifficulty] = useState<CatalogDifficulty | null>(initial.difficulty)
  const [force, setForce] = useState<CatalogForce | null>(initial.force)
  const [mechanic, setMechanic] = useState<CatalogMechanic | null>(initial.mechanic)
  const [category, setCategory] = useState<string | null>(initial.category)
  const [regionTab, setRegionTab] = useState<RegionTab>('all')

  const currentState = { muscle, equipment, difficulty, force, mechanic, category }

  const handleApply = () => {
    pickerFilterStore.setFilters({ ...pickerFilterStore.getFilters(), muscle, equipment, difficulty, force, mechanic, category })
    router.back()
  }

  const handleClearAll = () => {
    setMuscle(null)
    setEquipment(null)
    setDifficulty(null)
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
    if (preset.filters.difficulty !== undefined) setDifficulty(preset.filters.difficulty as CatalogDifficulty)
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
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}
    >
      <SheetTitle>Filters</SheetTitle>

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
                ? 'border-brand-accent bg-brand-accent'
                : 'border-border-secondary bg-background-tertiary',
            )}
          >
            <Text
              className={cn(
                'text-sm',
                isActive
                  ? 'font-inter-semibold text-background-primary'
                  : 'font-inter-medium text-content-primary',
              )}
            >
              {preset.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Muscle Group */}
      <SectionLabel text="Target Muscle" />
      <View className="flex-row gap-1.5 mb-3">
        {REGION_TABS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              setRegionTab(tab)
              setMuscle(null)
            }}
            className={cn(
              'rounded-full px-3 py-1 border',
              regionTab === tab ? 'bg-brand-accent border-brand-accent' : 'bg-background-tertiary border-border-secondary',
            )}
          >
            <Text
              className={cn(
                'text-xs',
                regionTab === tab
                  ? 'font-inter-semibold text-background-primary'
                  : 'font-inter-medium text-content-primary',
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
          variant="muscle"
          onToggle={(v) => toggleValue(muscle, v, setMuscle)}
        />
      </View>

      {/* Difficulty */}
      <SectionLabel text="Difficulty" />
      <View className="mb-5">
        <FilterSegmentedRow
          options={DIFFICULTY_OPTIONS}
          labels={DIFFICULTY_DISPLAY_LABELS}
          selected={difficulty}
          onToggle={(v) => toggleValue(difficulty, v as CatalogDifficulty, setDifficulty)}
          dotColors={Colors.level}
        />
      </View>

      {/* Movement Type */}
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
    </ScrollView>
  )
}

export default PickerFiltersScreen
