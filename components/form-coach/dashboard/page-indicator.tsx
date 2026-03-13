import { View } from 'react-native'

type PageIndicatorProps = {
  pageCount: number
  activeIndex: number
}

export const PageIndicator = ({ pageCount, activeIndex }: PageIndicatorProps) => {
  return (
    <View className="flex-row items-center justify-center gap-1.5 py-1">
      {Array.from({ length: pageCount }).map((_, i) => (
        <View
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i === activeIndex ? 'bg-lime-400' : 'bg-zinc-700'}`}
        />
      ))}
    </View>
  )
}
