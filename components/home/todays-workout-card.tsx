import { Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Clock, Flame, Link } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import { type MockWorkout } from '@/utils/mock-data'

interface TodaysWorkoutCardProps {
  workout: MockWorkout
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png',
  tiktok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
  youtube: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/120px-YouTube_full-color_icon_%282017%29.svg.png',
}

export const TodaysWorkoutCard = ({ workout }: TodaysWorkoutCardProps) => {
  return (
    <View className="mx-5 bg-background-secondary rounded-2xl p-4 overflow-hidden">
      <View className="flex-row">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-inter-bold text-content-primary">{workout.title}</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1">{workout.description}</Text>

          <View className="flex-row items-center gap-1.5 mt-2">
            {PLATFORM_ICONS[workout.platform] && (
              <Image
                source={{ uri: PLATFORM_ICONS[workout.platform] }}
                style={{ width: 16, height: 16 }}
              />
            )}
            <Text className="text-sm font-inter text-content-secondary">{workout.creatorHandle}</Text>
          </View>
        </View>

        <Image
          source={{ uri: workout.thumbnailUrl }}
          style={{ width: 100, height: 100, borderRadius: 12 }}
          contentFit="cover"
        />
      </View>

      <View className="flex-row items-center gap-2 mt-4">
        <Pressable
          onPress={() => console.log('Start workout')}
          className="bg-brand-accent rounded-md px-4 py-2"
        >
          <Text className="text-sm font-inter-semibold text-background-primary">Start</Text>
        </Pressable>

        <Pressable
          onPress={() => console.log('Edit workout')}
          className="rounded-md px-4 py-2"
        >
          <Text className="text-sm font-inter text-content-secondary">Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => console.log('Mark as rest')}
          className="rounded-md px-4 py-2"
        >
          <Text className="text-sm font-inter text-content-secondary">Rest</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border-primary">
        <View className="flex-row items-center gap-1">
          <Clock size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">{workout.duration}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Link size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">{workout.exerciseCount} workout</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Flame size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">{workout.calories} cal</Text>
        </View>
      </View>
    </View>
  )
}
