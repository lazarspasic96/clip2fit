import { H2, Paragraph, Text, YStack } from 'tamagui'
import { Link } from 'expo-router'
import { ToastControl } from 'app/current-toast'
import { useAppStore } from 'store'

export default function HomeScreen() {
  const { isDarkMode } = useAppStore()
  return (
    <YStack flex={1} px="$2" pt="$5" items="center" bg="$accent10">
      <H2 text="center">Welcome to Clip2Fit</H2>

      <ToastControl />

      <Text>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>

      <YStack items="center" justify="center" gap="$4" bg="transparent">
        <Paragraph>
          <Link href="../home-nested">Go to home-nested</Link>
        </Paragraph>
        <Paragraph color="$blue10" fontSize="$5" text="center">
          Clip2Fit is a fitness app that helps you to track your workouts and progress.
        </Paragraph>

        <Paragraph fontSize="$5" text="center">
          Clip2Fit is great!
        </Paragraph>
      </YStack>
    </YStack>
  )
}
