import { FlashList } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Link } from 'expo-router'
import { Dumbbell } from 'lucide-react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { CardAddButton } from '@/components/catalog/card-add-button'
import { CatalogDesignShell } from '@/components/catalog/shared/catalog-design-shell'
import { Colors } from '@/constants/colors'
import type { CatalogDesignProps, CatalogExercise } from '@/types/catalog'
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/types/catalog'

type MagazineRow =
  | { type: 'hero'; exercise: CatalogExercise; key: string }
  | { type: 'pair'; exercises: CatalogExercise[]; key: string }

const groupIntoRows = (items: CatalogExercise[]): MagazineRow[] => {
  const rows: MagazineRow[] = []

  for (let i = 0; i < items.length; ) {
    rows.push({ type: 'hero', exercise: items[i], key: `h-${items[i].id}` })
    i++

    for (let p = 0; p < 2 && i < items.length; p++) {
      const pair = items.slice(i, Math.min(i + 2, items.length))
      rows.push({ type: 'pair', exercises: pair, key: `p-${pair.map((e) => e.id).join('-')}` })
      i += pair.length
    }
  }

  return rows
}

const HeroCard = ({
  exercise,
  onToggle,
  isSelected,
  isDisabled,
}: {
  exercise: CatalogExercise
  onToggle: () => void
  isSelected: boolean
  isDisabled: boolean
}) => {
  const muscleLabel = MUSCLE_GROUP_LABELS[exercise.target] ?? exercise.target
  const hasThumbnail = exercise.thumbnailUrl !== null

  return (
    <Link href={`/(protected)/exercise-detail?id=${exercise.id}` as never} asChild push>
      <Pressable
        style={{
          height: 200,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#ffff',
          borderCurve: 'continuous',
          borderWidth: isSelected ? 1.5 : 0,
          borderColor: isSelected ? Colors.brand.accent : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {hasThumbnail ? (
          <Image
            source={{ uri: exercise.thumbnailUrl ?? undefined }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={36} color={Colors.content.tertiary} />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(9,9,11,0.9)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%' }}
        />

        <View style={{ position: 'absolute', bottom: 14, left: 16, right: 52 }}>
          <Text className="text-lg font-onest-bold text-content-primary" numberOfLines={2}>
            {exercise.name}
          </Text>
          <Text className="text-[13px] font-inter text-content-secondary" numberOfLines={1} style={{ marginTop: 2 }}>
            {muscleLabel} · {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
          </Text>
        </View>

        <CardAddButton isSelected={isSelected} isDisabled={isDisabled} onToggle={onToggle} position="top-right" />
      </Pressable>
    </Link>
  )
}

const GridCard = ({
  exercise,
  onToggle,
  isSelected,
  isDisabled,
}: {
  exercise: CatalogExercise
  onToggle: () => void
  isSelected: boolean
  isDisabled: boolean
}) => {
  const muscleLabel = MUSCLE_GROUP_LABELS[exercise.target] ?? exercise.target
  const hasThumbnail = exercise.thumbnailUrl !== null
  const difficultyColor =
    exercise.difficulty !== null
      ? (Colors.difficulty[exercise.difficulty as keyof typeof Colors.difficulty] ?? null)
      : null

  return (
    <Link href={`/(protected)/exercise-detail?id=${exercise.id}` as never} asChild push>
      <Pressable
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: Colors.background.tertiary,
          borderCurve: 'continuous',
          borderWidth: isSelected ? 1.5 : 0,
          borderColor: isSelected ? Colors.brand.accent : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <View style={{ height: 110 }}>
          {hasThumbnail ? (
            <Image
              source={{ uri: exercise.thumbnailUrl ?? undefined }}
              style={{ flex: 1 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-background-secondary">
              <Dumbbell size={22} color={Colors.content.tertiary} />
            </View>
          )}
        </View>

        <CardAddButton isSelected={isSelected} isDisabled={isDisabled} onToggle={onToggle} position="top-right" />

        <View style={{ padding: 10, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {difficultyColor !== null && (
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: difficultyColor }} />
            )}
            <Text className="text-sm font-inter-semibold text-content-primary" numberOfLines={1} style={{ flex: 1 }}>
              {exercise.name}
            </Text>
          </View>
          <Text className="text-xs font-inter text-content-tertiary" numberOfLines={1}>
            {muscleLabel}
          </Text>
        </View>
      </Pressable>
    </Link>
  )
}

export const DesignMagazine = (props: CatalogDesignProps) => {
  const {
    items,
    onToggle,
    isSelected,
    isDisabled = () => false,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    refetch,
    selectionVersion,
    bottomInset = 0,
  } = props

  const rows = groupIntoRows(items)

  return (
    <CatalogDesignShell
      {...props}
      renderList={() => (
        <FlashList
          data={rows}
          keyExtractor={(row) => row.key}
          extraData={selectionVersion}
          getItemType={(row) => row.type}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomInset }}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.content.tertiary} />
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )
          }
          renderItem={({ item: row }) => {
            if (row.type === 'hero') {
              return (
                <HeroCard
                  exercise={row.exercise}
                  onToggle={() => onToggle(row.exercise)}
                  isSelected={isSelected(row.exercise.id)}
                  isDisabled={isDisabled(row.exercise.id)}
                />
              )
            }
            return (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {row.exercises.map((exercise) => (
                  <View key={exercise.id} style={{ flex: 1 }}>
                    <GridCard
                      exercise={exercise}
                      onToggle={() => onToggle(exercise)}
                      isSelected={isSelected(exercise.id)}
                      isDisabled={isDisabled(exercise.id)}
                    />
                  </View>
                ))}
                {row.exercises.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            )
          }}
        />
      )}
    />
  )
}
