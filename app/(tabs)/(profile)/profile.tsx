import { Check } from '@tamagui/lucide-icons';
import { Checkbox, Text, View } from 'tamagui';

export default function ProfileScreen() {
  return (
    <View flex={1} items="center" justify="center" bg="$background">
      <Text fontSize={20} color="$blue10">
        Profile
      </Text>
    </View>
  );
}
