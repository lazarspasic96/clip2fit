import { Check, Circle } from 'lucide-react-native'
import { Text, View } from 'react-native'

import type { JointName } from '@/constants/pose-skeleton'
import type { FormRuleConfig } from '@/types/form-rules'

type SetupDashboardProps = {
  formRules: FormRuleConfig | null
  jointChecklist: Record<string, boolean>
  setupProgress: number
}

export const SetupDashboard = ({ formRules, jointChecklist, setupProgress }: SetupDashboardProps) => {
  const requiredJoints: JointName[] = formRules?.requiredJoints ?? []
  const equipment = formRules?.equipment ?? 'bodyweight'
  const instructions = formRules?.setupInstructions ?? 'Position yourself so all joints are visible'

  return (
    <View className="flex-1 px-3 py-2 gap-2">
      {/* Exercise + equipment */}
      <View className="flex-row items-center gap-2">
        {formRules !== null && (
          <Text className="text-white text-sm font-inter-bold">
            {formRules.canonicalName}
          </Text>
        )}
        <Text className="text-zinc-500 text-xs font-inter-medium capitalize">{equipment}</Text>
      </View>

      {/* Instructions */}
      <Text className="text-zinc-400 text-xs font-inter-medium">{instructions}</Text>

      {/* Joint checklist */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
        {requiredJoints.map((joint) => {
          const detected = jointChecklist[joint] === true
          return (
            <View key={joint} className="flex-row items-center gap-1">
              {detected ? (
                <Check size={12} color="#a3e635" pointerEvents="none" />
              ) : (
                <Circle size={12} color="#52525b" pointerEvents="none" />
              )}
              <Text className={`text-xs font-inter-medium ${detected ? 'text-lime-400' : 'text-zinc-500'}`}>
                {joint.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Progress bar */}
      <View className="mt-auto gap-1">
        <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-lime-400 rounded-full"
            style={{ width: `${Math.round(setupProgress * 100)}%` }}
          />
        </View>
        <Text className="text-zinc-500 text-[10px] font-inter-medium text-right">
          {Math.round(setupProgress * 100)}%
        </Text>
      </View>
    </View>
  )
}
