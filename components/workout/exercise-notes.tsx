import { Colors } from '@/constants/colors'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

interface ExerciseNotesProps {
  notes: string | null
}

export const ExerciseNotes = ({ notes }: ExerciseNotesProps) => {
  const [expanded, setExpanded] = useState(false)

  if (notes === null) return null

  return (
    <View className="mt-2">
      <Pressable onPress={() => setExpanded(expanded === false)} className="flex-row items-center gap-1">
        <Text className="text-xs font-inter-medium text-content-secondary">Notes</Text>
        {expanded ? (
          <ChevronUp size={12} color={Colors.content.secondary} pointerEvents="none" />
        ) : (
          <ChevronDown size={12} color={Colors.content.secondary} pointerEvents="none" />
        )}
      </Pressable>
      {expanded && <Text className="text-xs font-inter text-content-tertiary mt-1">{notes}</Text>}
    </View>
  )
}
