import { Check, Circle } from 'lucide-react-native'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import type { JointName } from '@/constants/pose-skeleton'

// Readable labels for joints
const JOINT_LABELS: Partial<Record<JointName, string>> = {
  leftShoulder: 'Left Shoulder',
  rightShoulder: 'Right Shoulder',
  leftElbow: 'Left Elbow',
  rightElbow: 'Right Elbow',
  leftWrist: 'Left Wrist',
  rightWrist: 'Right Wrist',
  leftHip: 'Left Hip',
  rightHip: 'Right Hip',
  leftKnee: 'Left Knee',
  rightKnee: 'Right Knee',
  leftAnkle: 'Left Ankle',
  rightAnkle: 'Right Ankle',
  neck: 'Neck',
  root: 'Torso',
  nose: 'Head',
}

type SetupOverlayProps = {
  jointChecklist: Record<string, boolean>
  requiredJoints: JointName[]
  setupProgress: number
  instructions: string | null
}

export const SetupOverlay = ({
  jointChecklist,
  requiredJoints,
  setupProgress,
  instructions,
}: SetupOverlayProps) => {
  const allReady = requiredJoints.every((j) => jointChecklist[j] === true)

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={StyleSheet.absoluteFill}
      className="items-center justify-center"
      pointerEvents="none"
    >
      <View className="bg-black/70 rounded-2xl px-6 py-5 mx-8 gap-4 max-w-sm">
        <Text className="text-white text-lg font-inter-bold text-center">
          Position Yourself
        </Text>

        {instructions !== null && (
          <Text className="text-zinc-300 text-sm font-inter-medium text-center">
            {instructions}
          </Text>
        )}

        {instructions === null && (
          <Text className="text-zinc-300 text-sm font-inter-medium text-center">
            Place your phone 6-8 feet away so your full body is visible
          </Text>
        )}

        {/* Joint checklist */}
        <View className="gap-2">
          {requiredJoints.map((joint) => {
            const ready = jointChecklist[joint] === true
            const label = JOINT_LABELS[joint] ?? joint
            return (
              <View key={joint} className="flex-row items-center gap-2">
                {ready ? (
                  <Check size={16} color="#84cc16" pointerEvents="none" />
                ) : (
                  <Circle size={16} color="#71717a" pointerEvents="none" />
                )}
                <Text
                  className={`text-sm font-inter-medium ${ready ? 'text-lime-400' : 'text-zinc-500'}`}
                >
                  {label}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Countdown indicator */}
        {allReady && (
          <Animated.View entering={FadeIn.duration(150)} className="items-center gap-2">
            <View className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-lime-400 rounded-full"
                style={{ width: `${setupProgress * 100}%` }}
              />
            </View>
            <Text className="text-lime-400 text-xs font-inter-medium">
              Hold position...
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  )
}
