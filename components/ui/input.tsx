import { Colors } from '@/constants/colors'
import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { cn } from './cn'

interface InputProps extends Omit<TextInputProps, 'className'> {
  error?: boolean
  disabled?: boolean
  className?: string
}

export type { InputProps }

export function Input({ error, disabled, className, secureTextEntry, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const showToggle = secureTextEntry !== undefined

  return (
    <View
      className={cn(
        'flex-row items-center rounded-md border bg-background-secondary px-4',
        error ? 'border-content-badge-error' : isFocused ? 'border-brand-accent' : 'border-border-primary',
        disabled && 'opacity-50',
        className,
      )}
    >
      <TextInput
        className="flex-1 py-4 font-inter text-content-primary"
        placeholderTextColor={Colors.content.tertiary}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        editable={!disabled}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
      {showToggle && (
        <Pressable onPress={() => setIsPasswordVisible((v) => !v)} hitSlop={8} disabled={disabled}>
          {isPasswordVisible ? <EyeOff size={20} color={Colors.content.tertiary} /> : <Eye size={20} color={Colors.content.tertiary} />}
        </Pressable>
      )}
    </View>
  )
}
