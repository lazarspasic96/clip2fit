import { Canvas, Line, vec } from '@shopify/react-native-skia'
import { StyleSheet } from 'react-native'

type PathPoint = { x: number; y: number }

type BarbellPathOverlayProps = {
  path: PathPoint[]
  isDrifting: boolean
  width: number
  height: number
}

const NORMAL_COLOR = '#22d3ee' // cyan-400
const DRIFT_COLOR = '#ef4444' // red-500

export const BarbellPathOverlay = ({
  path,
  isDrifting,
  width,
  height,
}: BarbellPathOverlayProps) => {
  if (path.length < 2) return null

  const color = isDrifting ? DRIFT_COLOR : NORMAL_COLOR

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {path.slice(1).map((point, i) => {
        const prev = path[i]
        // Fade older segments
        const opacity = ((i + 1) / path.length)
        const segmentColor = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`

        return (
          <Line
            key={i}
            p1={vec(prev.x * width, prev.y * height)}
            p2={vec(point.x * width, point.y * height)}
            color={segmentColor}
            strokeWidth={3}
            style="stroke"
          />
        )
      })}
    </Canvas>
  )
}
