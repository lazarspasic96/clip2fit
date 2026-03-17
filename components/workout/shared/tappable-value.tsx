import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface TappableValueProps {
  value: number
  unit: string
  onChangeValue: (value: number) => void
  decimal?: boolean
}

export const TappableValue = ({ value, unit, onChangeValue, decimal = false }: TappableValueProps) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const startEditing = () => {
    setDraft(decimal ? String(value) : String(Math.round(value)))
    setEditing(true)
  }

  const commitValue = () => {
    setEditing(false)
    const parsed = decimal ? parseFloat(draft) : parseInt(draft, 10)
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChangeValue(parsed)
    }
  }

  if (editing) {
    return (
      <View className="items-center flex-row justify-center gap-1">
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          onBlur={commitValue}
          onSubmitEditing={commitValue}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          selectTextOnFocus
          returnKeyType="done"
          style={{
            color: Colors.brand.accent,
            fontSize: 20,
            fontFamily: 'Inter-Bold',
            textAlign: 'center',
            minWidth: 48,
            padding: 0,
          }}
          selectionColor={Colors.brand.accent}
        />
        <Text className="text-xl font-inter-bold text-content-primary">{unit}</Text>
      </View>
    )
  }

  return (
    <Pressable onPress={startEditing} hitSlop={8}>
      <View className="items-center flex-row gap-1">
        <Text className="text-xl font-inter-bold text-content-primary">{decimal ? value : Math.round(value)}</Text>
        <Text className="text-xl font-inter-bold text-content-primary">{unit}</Text>
      </View>
    </Pressable>
  )
}
