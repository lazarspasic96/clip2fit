import { Text, View } from 'react-native'

interface ExerciseInstructionsProps {
  instructions: string[]
}

export const ExerciseInstructions = ({ instructions }: ExerciseInstructionsProps) => {
  return (
    <View>
      <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-3">
        Instructions
      </Text>

      {instructions.length === 0 ? (
        <Text className="text-sm font-inter text-content-tertiary">
          No instructions available
        </Text>
      ) : (
        <View className="gap-3">
          {instructions.map((step, index) => (
            <View key={index} className="flex-row">
              <View className="items-center justify-center mr-3 w-6 h-6">
                <Text className="text-sm font-inter-bold text-brand-accent">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-sm font-inter text-content-primary leading-5 flex-1">
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
