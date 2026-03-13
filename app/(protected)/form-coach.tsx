import { useIsFocused } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { runOnUI, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BarbellPathOverlay } from '@/components/form-coach/barbell-path-overlay'
import { BodyHighlightOverlay } from '@/components/form-coach/body-highlight-overlay'
import { BodyNotDetectedOverlay } from '@/components/form-coach/body-not-detected-overlay'
import { CameraAngleToast } from '@/components/form-coach/camera-angle-toast'
import { CameraFlipButton } from '@/components/form-coach/camera-flip-button'
import { FormDashboard } from '@/components/form-coach/dashboard/form-dashboard'
import { ExerciseSheet } from '@/components/form-coach/exercise-sheet'
import { PermissionDeniedView } from '@/components/form-coach/permission-denied-view'
import { SetupOverlay } from '@/components/form-coach/setup-overlay'
import { SkeletonOverlay } from '@/components/form-coach/skeleton-overlay'
import { TtsMuteButton } from '@/components/form-coach/tts-mute-button'
import { UnreliableCheckNote } from '@/components/form-coach/unreliable-check-note'
import { WorkoutSummaryScreen } from '@/components/form-coach/workout-summary-screen'
import { hasFormRules, getCanonicalExerciseNames } from '@/constants/form-rules'
import { REQUIRED_JOINTS_DEFAULT } from '@/constants/pose-skeleton'
import { useCameraLayout } from '@/hooks/use-camera-layout'
import { useFormCoachOrchestrator } from '@/hooks/use-form-coach-orchestrator'
import { useWorkoutsQuery } from '@/hooks/use-api'
import ExpoPoseCameraModule, {
  ExpoPoseCameraView,
  type PoseDetectedEvent,
  type PoseLandmark,
} from '@/modules/expo-pose-camera'

const FormCoachScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const { exercise: exerciseParam } = useLocalSearchParams<{ exercise?: string }>()
  const { workouts } = useWorkoutsQuery()

  const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseParam ?? null)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'loading' | 'granted' | 'denied'>('loading')
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 })
  const [cameraSize, setCameraSize] = useState({ width: 0, height: 0 })
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')

  const { isLandscape, direction, cameraFlex, dashboardFlex } = useCameraLayout(layoutSize)
  const landmarksSharedValue = useSharedValue<PoseLandmark[]>([])

  const orch = useFormCoachOrchestrator({
    landmarks: landmarksSharedValue,
    selectedExercise,
  })

  const allExerciseNames = Array.from(
    new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name)))
  )
  const exerciseNames = allExerciseNames.filter((name) => hasFormRules(name)).sort()
  const displayExercises = exerciseNames.length > 0 ? exerciseNames : getCanonicalExerciseNames()

  // Unlock orientation
  useEffect(() => {
    if (isFocused) {
      ScreenOrientation.unlockAsync()
    }
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  }, [isFocused])

  // Camera permission
  useEffect(() => {
    const checkPermission = async () => {
      const status = ExpoPoseCameraModule.getCameraPermissionStatus()
      if (status === 'granted') {
        setPermissionStatus('granted')
      } else if (status === 'denied') {
        setPermissionStatus('denied')
      } else {
        const granted = await ExpoPoseCameraModule.requestCameraPermission()
        setPermissionStatus(granted ? 'granted' : 'denied')
      }
    }
    checkPermission()
  }, [])

  // Sync exercise param
  useEffect(() => {
    if (exerciseParam !== undefined) setSelectedExercise(exerciseParam)
  }, [exerciseParam])

  const handlePoseDetected = (event: { nativeEvent: PoseDetectedEvent }) => {
    const lm = event.nativeEvent.landmarks
    runOnUI(() => {
      'worklet'
      landmarksSharedValue.value = lm
    })()
  }

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise)
    setSheetVisible(false)
    orch.handleExerciseSwitch(exercise)
  }

  const handleClose = () => {
    if (orch.screenState === 'active' || orch.screenState === 'rest') {
      orch.goToSummary()
      return
    }
    router.back()
  }

  if (orch.screenState === 'summary') {
    return <WorkoutSummaryScreen />
  }

  if (permissionStatus === 'loading') {
    return <View className="flex-1 bg-background-primary" />
  }

  if (permissionStatus === 'denied') {
    return (
      <View className="flex-1">
        <PermissionDeniedView />
        <Pressable
          onPress={() => router.back()}
          style={{ position: 'absolute', top: insets.top + 12, right: 16 }}
          className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
        >
          <X size={20} color="#fafafa" pointerEvents="none" />
        </Pressable>
      </View>
    )
  }

  const requiredJoints = orch.formRules?.requiredJoints ?? REQUIRED_JOINTS_DEFAULT

  return (
    <View
      className="flex-1 bg-black"
      style={{ flexDirection: direction }}
      onLayout={(e) => setLayoutSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {/* Camera section */}
      <View
        style={{ flex: cameraFlex }}
        onLayout={(e) => setCameraSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        <ExpoPoseCameraView
          isActive={isFocused}
          cameraPosition={cameraPosition}
          onPoseDetected={handlePoseDetected}
          style={StyleSheet.absoluteFill}
        />

        {cameraSize.width > 0 && (
          <SkeletonOverlay
            landmarks={landmarksSharedValue}
            width={cameraSize.width}
            height={cameraSize.height}
            dimmed={orch.screenState === 'rest'}
            issueJoints={orch.issueJointsSharedValue}
          />
        )}

        {orch.screenState === 'active' && cameraSize.width > 0 && orch.formIssues.length > 0 && (
          <BodyHighlightOverlay
            landmarks={landmarksSharedValue}
            issues={orch.formIssues}
            width={cameraSize.width}
            height={cameraSize.height}
          />
        )}

        {orch.screenState === 'active' && orch.isBarbell && cameraSize.width > 0 && (
          <BarbellPathOverlay
            path={orch.barbellPath}
            isDrifting={orch.barbellDrifting}
            width={cameraSize.width}
            height={cameraSize.height}
          />
        )}

        {orch.screenState === 'setup' && (
          <SetupOverlay
            jointChecklist={orch.jointChecklist}
            requiredJoints={requiredJoints}
            setupProgress={orch.setupProgress}
            instructions={orch.formRules?.setupInstructions ?? null}
          />
        )}

        <BodyNotDetectedOverlay visible={!orch.bodyDetected && orch.screenState !== 'setup'} />

        {orch.screenState === 'active' && (
          <UnreliableCheckNote skippedChecks={orch.skippedChecks} currentAngle={orch.cameraAngle} />
        )}

        <CameraAngleToast visible={orch.showAngleToast} onDismiss={orch.dismissAngleToast} />

        {/* Camera controls */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CameraFlipButton onPress={() => setCameraPosition((p) => p === 'back' ? 'front' : 'back')} />
          <TtsMuteButton isMuted={orch.isMuted} onPress={orch.toggleMute} />

          <Pressable
            onPress={handleClose}
            style={{ position: 'absolute', top: insets.top + 12, right: 16 }}
            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          >
            <X size={20} color="#fafafa" pointerEvents="none" />
          </Pressable>
        </View>
      </View>

      {/* Dashboard section */}
      <FormDashboard
        style={{ flex: dashboardFlex }}
        screenState={orch.screenState}
        formIssues={orch.formIssues}
        skippedChecks={orch.skippedChecks}
        debugAngles={orch.debugAngles}
        cameraAngle={orch.cameraAngle}
        repCount={orch.repCount}
        barbellPath={orch.barbellPath}
        barbellDrifting={orch.barbellDrifting}
        isBarbell={orch.isBarbell}
        coachingMessage={orch.coachingMessage}
        formRules={orch.formRules}
        jointChecklist={orch.jointChecklist}
        setupProgress={orch.setupProgress}
        selectedExercise={selectedExercise}
        lastConcentricMs={orch.lastConcentricMs}
        setNumber={orch.setNumber}
        onExercisePress={() => setSheetVisible(true)}
        isLandscape={isLandscape}
      />

      <Modal
        visible={sheetVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setSheetVisible(false)}
      >
        <ExerciseSheet exercises={displayExercises} onSelect={handleExerciseSelect} />
      </Modal>
    </View>
  )
}

export default FormCoachScreen
