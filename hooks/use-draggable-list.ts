import * as Haptics from 'expo-haptics'
import { Gesture, type GestureType } from 'react-native-gesture-handler'
import { runOnJS, type SharedValue, useSharedValue } from 'react-native-reanimated'

const DRAG_ACTIVATE_MS = 200

interface UseDraggableListOptions {
  itemCount: number
  itemHeight: number
  onReorder: (fromIndex: number, toIndex: number) => void
}

export interface DragState {
  activeIndex: SharedValue<number>
  hoveredIndex: SharedValue<number>
  translateY: SharedValue<number>
  isDragging: SharedValue<boolean>
}

export const useDraggableList = ({ itemCount, itemHeight, onReorder }: UseDraggableListOptions) => {
  const activeIndex = useSharedValue(-1)
  const hoveredIndex = useSharedValue(-1)
  const translateY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const finishDrag = (from: number, to: number) => {
    if (from !== to && from >= 0 && to >= 0 && to < itemCount) {
      onReorder(from, to)
    }
  }

  const createGesture = (index: number): GestureType =>
    Gesture.Pan()
      .activateAfterLongPress(DRAG_ACTIVATE_MS)
      .onStart(() => {
        activeIndex.value = index
        hoveredIndex.value = index
        isDragging.value = true
        translateY.value = 0
        runOnJS(triggerHaptic)()
      })
      .onUpdate((e) => {
        translateY.value = e.translationY
        const newIdx = Math.round(
          Math.min(Math.max(index + e.translationY / itemHeight, 0), itemCount - 1),
        )
        if (newIdx !== hoveredIndex.value) {
          hoveredIndex.value = newIdx
          runOnJS(triggerHaptic)()
        }
      })
      .onEnd(() => {
        const from = activeIndex.value
        const to = hoveredIndex.value
        translateY.value = 0
        activeIndex.value = -1
        hoveredIndex.value = -1
        isDragging.value = false
        runOnJS(finishDrag)(from, to)
      })
      .onFinalize(() => {
        if (activeIndex.value !== -1) {
          translateY.value = 0
          activeIndex.value = -1
          hoveredIndex.value = -1
          isDragging.value = false
        }
      })

  const dragState: DragState = { activeIndex, hoveredIndex, translateY, isDragging }

  return { createGesture, dragState, itemHeight }
}
