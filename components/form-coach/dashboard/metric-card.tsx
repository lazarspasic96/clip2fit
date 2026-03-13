import { Text, View } from 'react-native'

type MetricCardProps = {
  label: string
  value: string | number
  unit?: string
  color?: string
  monospace?: boolean
}

export const MetricCard = ({ label, value, unit, color, monospace }: MetricCardProps) => {
  const valueColor = color ?? 'text-white'
  const fontClass = monospace ? 'font-mono' : 'font-inter-bold'

  return (
    <View className="bg-zinc-900 rounded-lg px-3 py-2 flex-1">
      <Text className="text-zinc-500 text-[10px] font-inter-medium uppercase tracking-wider">
        {label}
      </Text>
      <Text className={`${valueColor} text-lg ${fontClass}`}>
        {value}
        {unit !== undefined && (
          <Text className="text-zinc-500 text-xs font-inter-medium"> {unit}</Text>
        )}
      </Text>
    </View>
  )
}
