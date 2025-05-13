import { ExternalLink } from "@tamagui/lucide-icons";
import { Anchor, H2, Paragraph, XStack, YStack } from "tamagui";
import { ToastControl } from "app/CurrentToast";

export default function HomeScreen() {
  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <H2 text="center">Welcome to Clip2Fit</H2>

      <ToastControl />

      <YStack
        items="center"
        justify="center"
        gap="$1.5"
        position="absolute"
        bg="#f0f0f0"
        height="100%"
        b="$8"
      >
        <Paragraph fontSize="$5" text="center">
          Clip2Fit is a fitness app that helps you to track your workouts and
          progress.
        </Paragraph>
      </YStack>
    </YStack>
  );
}
