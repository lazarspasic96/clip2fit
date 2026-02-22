import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useIsFocused } from '@react-navigation/native'
import { useCameraPermissions } from 'expo-camera'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { runOnUI, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ExerciseSheet } from '@/components/form-coach/exercise-sheet'
import { PermissionDeniedView } from '@/components/form-coach/permission-denied-view'
import { SkeletonOverlay } from '@/components/form-coach/skeleton-overlay'
import type { PoseDetectedEvent, PoseLandmark } from '@/modules/expo-pose-camera'
import { ExposePoseCameraView } from '@/modules/expo-pose-camera'
import { buildPoseFrameSummary } from '@/utils/pose-metrics'

const POSE_DEBUG_LOG_INTERVAL_MS = 1000
const POSE_DEBUG_INCLUDE_RAW_LANDMARKS = true

const formatRawLandmarksForLog = (landmarks: PoseLandmark[]) => {
  return landmarks.map((lm) => ({
    joint: lm.joint,
    x: Math.round(lm.x * 1000) / 1000,
    y: Math.round(lm.y * 1000) / 1000,
    confidence: Math.round(lm.confidence * 1000) / 1000,
  }))
}

const FormCoachScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const { width, height } = useWindowDimensions()
  const { exercise: initialExercise } = useLocalSearchParams<{ exercise?: string }>()

  const exerciseSheetRef = useRef<BottomSheetModal>(null)
  const lastPoseLogAtRef = useRef(0)
  const [exercise, setExercise] = useState(initialExercise)
  const [cameraPermission, requestPermission] = useCameraPermissions()
  const landmarksSharedValue = useSharedValue<PoseLandmark[]>([])

  // Request camera permission on mount
  useEffect(() => {
    if (cameraPermission === null || !cameraPermission.granted) {
      requestPermission()
    }
  }, [cameraPermission, requestPermission])

  // Lock to portrait while screen is focused
  useEffect(() => {
    if (isFocused) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
    return () => {
      ScreenOrientation.unlockAsync()
    }
  }, [isFocused])

  const handlePoseDetected = (event: { nativeEvent: PoseDetectedEvent }) => {
    const lm = event.nativeEvent.landmarks

    if (__DEV__) {
      const now = Date.now()
      if (now - lastPoseLogAtRef.current >= POSE_DEBUG_LOG_INTERVAL_MS) {
        lastPoseLogAtRef.current = now
        const frameSummary = buildPoseFrameSummary(lm)
        console.log(
          '[FormCoach][PoseFrame]',
          JSON.stringify({
            exercise: exercise ?? null,
            ...frameSummary,
            rawLandmarks: POSE_DEBUG_INCLUDE_RAW_LANDMARKS ? formatRawLandmarksForLog(lm) : undefined,
          })
        )
      }
    }

    runOnUI(() => {
      'worklet'
      landmarksSharedValue.value = lm
    })()
  }

  const handleExerciseSelect = (name: string) => {
    setExercise(name)
  }

  const isGranted = cameraPermission?.granted === true
  const isDenied = cameraPermission !== null && !cameraPermission.granted && !cameraPermission.canAskAgain

  if (isDenied) {
    return (
      <View className="flex-1 bg-black">
        <Pressable
          onPress={() => router.back()}
          className="absolute z-10 right-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          style={{ top: insets.top + 8 }}
        >
          <X size={20} color="#fff" pointerEvents="none" />
        </Pressable>
        <PermissionDeniedView />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      {/* Native camera view */}
      {isGranted && (
        <ExposePoseCameraView
          style={StyleSheet.absoluteFill}
          isActive={isFocused}
          onPoseDetected={handlePoseDetected}
        />
      )}

      {/* Skeleton overlay */}
      <SkeletonOverlay landmarks={landmarksSharedValue} width={width} height={height} />

      {/* Close button */}
      <Pressable
        onPress={() => router.back()}
        className="absolute z-10 right-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
        style={{ top: insets.top + 8 }}
      >
        <X size={20} color="#fff" pointerEvents="none" />
      </Pressable>

      {/* Exercise label at bottom — tappable to reopen sheet */}
      {exercise !== undefined && exercise.length > 0 && (
        <Pressable
          onPress={() => exerciseSheetRef.current?.present()}
          className="absolute bottom-0 left-0 right-0 items-center"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="bg-white/20 px-5 py-2.5 rounded-full">
            <Text className="text-white font-semibold text-base">{exercise}</Text>
          </View>
        </Pressable>
      )}

      <ExerciseSheet ref={exerciseSheetRef} onSelect={handleExerciseSelect} />
    </View>
  )
}

export default FormCoachScreen
