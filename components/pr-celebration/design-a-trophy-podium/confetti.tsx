import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

const PARTICLE_COUNT = 40
const COLORS = ['#84cc16', '#bef264', '#f59e0b', '#facc15', '#22d3ee', '#a78bfa', '#f472b6', '#fafafa']

interface Particle {
  id: number
  color: string
  startX: number
  endX: number
  size: number
  rotation: number
  delay: number
  duration: number
}

const generateParticles = (screenWidth: number): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length] as string,
    startX: Math.random() * screenWidth,
    endX: (Math.random() - 0.5) * 120,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    delay: Math.random() * 800,
    duration: 3000 + Math.random() * 2000,
  }))

const ConfettiPiece = ({ particle }: { particle: Particle }) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: particle.duration, easing: Easing.inOut(Easing.quad) }),
    )
  }, [particle.delay, particle.duration, progress])

  const style = useAnimatedStyle(() => {
    const p = progress.value
    return {
      position: 'absolute',
      left: particle.startX + particle.endX * p,
      top: -20 + p * 900,
      width: particle.size,
      height: particle.size * 1.4,
      borderRadius: particle.size * 0.2,
      backgroundColor: particle.color,
      opacity: p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2,
      transform: [
        { rotate: `${particle.rotation + p * 720}deg` },
        { scale: 1 - p * 0.3 },
      ],
    }
  })

  return <Animated.View style={style} />
}

export const Confetti = () => {
  const { width } = useWindowDimensions()
  const particles = generateParticles(width)

  return (
    <>
      {particles.map((p) => (
        <ConfettiPiece key={p.id} particle={p} />
      ))}
    </>
  )
}
