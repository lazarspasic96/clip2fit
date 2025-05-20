import { ArrowRight } from '@tamagui/lucide-icons'
import { Card, H4, H5, Paragraph, XStack, useTheme } from 'tamagui'

export const WorkoutCard = () => {
  const theme = useTheme()
  return (
    <Card
      animation="bouncy"
      width="100%"
      height={170}
      backgroundColor="white"
      rounded="$8"
      shadowColor="rgba(0,0,0,0.2)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.18}
      shadowRadius={4}
    >
      <Card.Header padded>
        <H4 fontWeight="bold">Today&apos;s Workout</H4>
        <H5 fontWeight="500" fontSize="$4" color={theme.gray10?.get()}>
          Full Body Workout 🏋️
        </H5>
      </Card.Header>

      <Card.Footer padded>
        <XStack items="center" gap="$2">
          <Paragraph fontSize="$4" color={theme.gray10?.get()}>
            65 min | 6 Exercises
          </Paragraph>
          <ArrowRight size={18} color="$blue10" />
        </XStack>
      </Card.Footer>
    </Card>
  )
}
