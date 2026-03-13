import { useRef, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, type ViewStyle } from 'react-native'

import type { CameraAngle, FormCoachScreenState, FormIssue, FormRuleConfig } from '@/types/form-rules'
import { formSessionStore } from '@/stores/form-session-store'

import { ActiveMetricsPage } from './active-metrics-page'
import { AdvancedMetricsPage } from './advanced-metrics-page'
import { DashboardHeader } from './dashboard-header'
import { PageIndicator } from './page-indicator'
import { RestDashboard } from './rest-dashboard'
import { SetupDashboard } from './setup-dashboard'

type FormDashboardProps = {
  style?: ViewStyle
  screenState: FormCoachScreenState
  formIssues: FormIssue[]
  skippedChecks: string[]
  debugAngles: Record<string, number>
  cameraAngle: CameraAngle
  repCount: number
  barbellPath: { x: number; y: number }[]
  barbellDrifting: boolean
  isBarbell: boolean
  coachingMessage: string | null
  formRules: FormRuleConfig | null
  jointChecklist: Record<string, boolean>
  setupProgress: number
  selectedExercise: string | null
  lastConcentricMs: number | null
  setNumber: number
  onExercisePress: () => void
  isLandscape: boolean
}

export const FormDashboard = ({
  style,
  screenState,
  formIssues,
  skippedChecks,
  debugAngles,
  cameraAngle,
  repCount,
  barbellPath,
  barbellDrifting,
  isBarbell,
  coachingMessage,
  formRules,
  jointChecklist,
  setupProgress,
  selectedExercise,
  lastConcentricMs,
  setNumber,
  onExercisePress,
  isLandscape,
}: FormDashboardProps) => {
  const [activePageIndex, setActivePageIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const pageWidth = event.nativeEvent.layoutMeasurement.width
    if (pageWidth > 0) {
      setActivePageIndex(Math.round(offsetX / pageWidth))
    }
  }

  const lastSet = formSessionStore.getLastFinishedSet()
  const borderClass = isLandscape ? 'border-l border-lime-400/10' : 'border-t border-lime-400/10'

  const angleRules = formRules?.angleRules.map((r) => ({
    name: r.name,
    ranges: r.ranges,
  }))

  return (
    <View className={`bg-zinc-950 ${borderClass}`} style={style}>
      <DashboardHeader
        exerciseName={selectedExercise}
        coachingMessage={coachingMessage}
        isResting={screenState === 'rest'}
        onExercisePress={onExercisePress}
      />

      {screenState === 'setup' && (
        <SetupDashboard
          formRules={formRules}
          jointChecklist={jointChecklist}
          setupProgress={setupProgress}
        />
      )}

      {screenState === 'active' && (
        <View className="flex-1">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={{ width: '100%' }}>
              <ActiveMetricsPage
                repCount={repCount}
                formIssues={formIssues}
                debugAngles={debugAngles}
                cameraAngle={cameraAngle}
                skippedChecks={skippedChecks}
                lastConcentricMs={lastConcentricMs}
                isBarbell={isBarbell}
                isLandscape={isLandscape}
                angleRules={angleRules}
              />
            </View>
            <View style={{ width: '100%' }}>
              <AdvancedMetricsPage
                debugAngles={debugAngles}
                barbellPath={barbellPath}
                barbellDrifting={barbellDrifting}
                isBarbell={isBarbell}
                skippedChecks={skippedChecks}
                isLandscape={isLandscape}
              />
            </View>
          </ScrollView>
          <PageIndicator pageCount={2} activeIndex={activePageIndex} />
        </View>
      )}

      {screenState === 'rest' && (
        <RestDashboard setNumber={setNumber} lastSet={lastSet} />
      )}
    </View>
  )
}
