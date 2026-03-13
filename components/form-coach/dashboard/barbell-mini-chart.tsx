import { Canvas, Line, vec } from '@shopify/react-native-skia'
import { View } from 'react-native'

const MAX_POINTS = 60
const CHART_HEIGHT = 60
const NORMAL_COLOR = '#22d3ee' // cyan-400
const DRIFT_COLOR = '#ef4444' // red-500
const REF_LINE_COLOR = '#3f3f46' // zinc-700

type BarbellMiniChartProps = {
  path: { x: number; y: number }[]
  isDrifting: boolean
}

export const BarbellMiniChart = ({ path, isDrifting }: BarbellMiniChartProps) => {
  if (path.length < 2) return null

  const recentPath = path.slice(-MAX_POINTS)
  const yValues = recentPath.map((p) => p.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const range = maxY - minY || 0.01

  const color = isDrifting ? DRIFT_COLOR : NORMAL_COLOR
  const referenceY = yValues[0]

  return (
    <View className="bg-zinc-900 rounded-lg overflow-hidden" style={{ height: CHART_HEIGHT }}>
      <Canvas style={{ flex: 1 }}>
        {/* Reference line at starting Y */}
        <Line
          p1={vec(0, ((referenceY - minY) / range) * CHART_HEIGHT)}
          p2={vec(999, ((referenceY - minY) / range) * CHART_HEIGHT)}
          color={REF_LINE_COLOR}
          strokeWidth={1}
          style="stroke"
        />

        {/* Path segments */}
        {recentPath.slice(1).map((point, i) => {
          const prev = recentPath[i]
          const xScale = 999 / (recentPath.length - 1)
          const opacity = (i + 1) / recentPath.length
          const segColor = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`

          return (
            <Line
              key={i}
              p1={vec(i * xScale, ((prev.y - minY) / range) * CHART_HEIGHT)}
              p2={vec((i + 1) * xScale, ((point.y - minY) / range) * CHART_HEIGHT)}
              color={segColor}
              strokeWidth={2}
              style="stroke"
            />
          )
        })}
      </Canvas>
    </View>
  )
}
