import { useAppStore } from 'store'
import { Button, Text, View } from 'tamagui'

export default function ProfileScreen() {
  const { isDarkMode, setDarkMode } = useAppStore()
  return (
    <View flex={1} items="center" justify="center" bg="$background">
      <Text fontSize={20} color="$blue10">
        Profile
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </Text>
      <Button onPress={() => setDarkMode(!isDarkMode)}>Toggle Dark Mode</Button>
    </View>
  )
}
