import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { ClipboardPaste, AlertCircle } from 'lucide-react-native'
import * as Clipboard from 'expo-clipboard'

import { Colors } from '@/constants/colors'
import { Button } from '@/components/ui/button'
import {
  TikTokIcon,
  InstagramIcon,
  YouTubeIcon,
  XIcon,
  FacebookIcon,
} from '@/components/ui/platform-icons'
import { validateWorkoutUrl } from '@/utils/url-validation'

interface UrlInputSectionProps {
  onSubmit: (url: string) => void
  errorMessage?: string
  initialUrl?: string
}

export const UrlInputSection = ({ onSubmit, errorMessage, initialUrl }: UrlInputSectionProps) => {
  const [url, setUrl] = useState(initialUrl ?? '')
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false)

  const validation = validateWorkoutUrl(url)
  const showError = hasAttemptedValidation && url.length > 0 && !validation.isValid

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync()
    if (text) {
      setUrl(text)
      setHasAttemptedValidation(true)
    }
  }

  const handleProcess = () => {
    setHasAttemptedValidation(true)
    if (validation.isValid) {
      onSubmit(validation.cleanUrl)
    }
  }

  return (
    <View className="flex-1 px-6 pt-8">
      {errorMessage !== undefined && (
        <View className="flex-row items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={20} color={Colors.badge.error.content} pointerEvents="none" />
          <Text className="flex-1 text-sm font-inter text-red-400">{errorMessage}</Text>
        </View>
      )}

      <Text className="text-2xl font-inter-bold text-content-primary mb-2">
        Paste a workout URL
      </Text>
      <Text className="text-base font-inter text-content-secondary mb-6">
        Share a workout video from your favorite platform
      </Text>

      <View className="flex-row items-center gap-2 mb-4">
        <View className="flex-1 flex-row items-center bg-background-secondary rounded-xl px-4 border border-border-primary">
          <TextInput
            value={url}
            onChangeText={(text) => {
              setUrl(text)
            }}
            placeholder="https://www.instagram.com/reel/..."
            placeholderTextColor={Colors.content.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleProcess}
            className="flex-1 text-base font-inter text-content-primary py-4"
          />
        </View>
        <Pressable
          onPress={handlePaste}
          className="items-center justify-center bg-background-secondary rounded-xl border border-border-primary w-[52px] h-[52px]"
          hitSlop={8}
        >
          <ClipboardPaste size={22} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </View>

      {showError && (
        <View className="flex-row items-center gap-2 mb-4">
          <AlertCircle size={16} color={Colors.badge.error.content} pointerEvents="none" />
          <Text className="text-sm font-inter text-red-400">
            This platform isn&apos;t supported yet
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-3 mb-8">
        <Text className="text-sm font-inter text-content-tertiary">Supported:</Text>
        <TikTokIcon size={18} />
        <InstagramIcon size={18} />
        <YouTubeIcon size={18} />
        <FacebookIcon size={18} />
        <XIcon size={16} />
      </View>

      <Button onPress={handleProcess} disabled={url.length === 0}>
        Process
      </Button>
    </View>
  )
}
