import Animated from 'react-native-reanimated'

const RING_COUNT = 3
const PULSE_DURATION = 2100
const STAGGER_DELAY = 700

const pulseKeyframes = {
  from: { transform: [{ scale: 1 }], opacity: 0.25 },
  to: { transform: [{ scale: 2.2 }], opacity: 0 },
}

interface PulseRingsProps {
  size: number
  isAnimating: boolean
}

export const PulseRings = ({ size, isAnimating }: PulseRingsProps) => {
  const playState = isAnimating ? 'running' : 'paused'

  return (
    <>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: 'rgba(132, 204, 22, 0.3)',
            animationName: pulseKeyframes,
            animationDuration: PULSE_DURATION,
            animationDelay: i * STAGGER_DELAY,
            animationTimingFunction: 'ease-out',
            animationIterationCount: 'infinite',
            animationFillMode: 'both',
            animationPlayState: playState,
          }}
        />
      ))}
    </>
  )
}
