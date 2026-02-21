import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Download, Link2, Video, X } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import { Button } from '@/components/ui/button'

const AddWorkoutScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [processing, setProcessing] = useState(false)

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll access to import workout videos.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedVideo(result.assets[0])
    }
  }

  const handleProcess = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      Alert.alert('Processing complete', 'Your workout has been processed.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    }, 2000)
  }

  if (selectedVideo) {
    return (
      <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Text className="text-2xl font-inter-bold text-content-primary">Add Workout</Text>
          <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
            <X size={24} color={Colors.content.primary} pointerEvents="none" />
          </Pressable>
        </View>

        <View className="flex-1 px-6 pt-6">
          <View className="bg-background-secondary rounded-2xl overflow-hidden">
            <Image
              source={{ uri: selectedVideo.uri }}
              className="w-full h-60"
              contentFit="cover"
            />
            <View className="p-4">
              <Text className="text-sm font-inter text-content-secondary">
                {Math.round((selectedVideo.duration ?? 0) / 1000)}s video selected
              </Text>
            </View>
          </View>

          <View className="mt-6">
            <Button onPress={handleProcess} loading={processing}>
              Process
            </Button>
          </View>

          <Pressable
            onPress={() => setSelectedVideo(null)}
            className="items-center mt-4"
          >
            <Text className="text-sm font-inter text-content-secondary">Choose a different video</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">Add Workout</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
          <X size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
      </View>

      <View className="flex-1 px-6 pt-6 gap-4">
        <Text className="text-base font-inter text-content-secondary mb-2">
          How would you like to add your workout?
        </Text>

        <Pressable
          onPress={() => {
            router.back()
            setTimeout(() => router.push('/(protected)/process-url' as never), 300)
          }}
          className="bg-background-secondary rounded-2xl p-6 flex-row items-center gap-4"
        >
          <View
            className="w-[52px] h-[52px] items-center justify-center rounded-full bg-brand-accent"
          >
            <Link2 size={26} color={Colors.background.primary} pointerEvents="none" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-inter-bold text-content-primary">From URL</Text>
            <Text className="text-sm font-inter text-content-secondary mt-1">
              Paste a link from TikTok, Instagram, YouTube
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={pickVideo}
          className="bg-background-secondary rounded-2xl p-6 flex-row items-center gap-4"
        >
          <View
            className="w-[52px] h-[52px] items-center justify-center rounded-full bg-background-tertiary"
          >
            <Video size={26} color={Colors.content.primary} pointerEvents="none" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-inter-bold text-content-primary">From Video</Text>
            <Text className="text-sm font-inter text-content-secondary mt-1">
              Pick a workout video from your camera roll
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            router.back()
            setTimeout(() => router.push('/(protected)/exercise-catalog' as never), 300)
          }}
          className="bg-background-secondary rounded-2xl p-6 flex-row items-center gap-4"
        >
          <View
            className="w-[52px] h-[52px] items-center justify-center rounded-full bg-background-tertiary"
          >
            <Download size={26} color={Colors.content.primary} pointerEvents="none" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-inter-bold text-content-primary">Manual Entry</Text>
            <Text className="text-sm font-inter text-content-secondary mt-1">
              Add exercises manually step by step
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

export default AddWorkoutScreen
