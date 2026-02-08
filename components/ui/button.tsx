import { ActivityIndicator, Pressable, Text, type ViewStyle } from 'react-native'

import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  children: string
  variant?: ButtonVariant
  className?: string
  style?: ViewStyle
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-background-button-primary',
  secondary: 'bg-background-button-secondary border border-border-primary',
  ghost: 'bg-transparent',
}

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-content-button-primary',
  secondary: 'text-content-primary',
  ghost: 'text-content-secondary',
}

const SPINNER_COLORS: Record<ButtonVariant, string> = {
  primary: '#18181b',
  secondary: '#fafafa',
  ghost: '#a1a1aa',
}

export const Button = ({
  onPress,
  loading,
  disabled,
  children,
  variant = 'primary',
  className,
  style,
}: ButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'items-center justify-center rounded-md py-3.5',
        VARIANT_CLASSES[variant],
        isDisabled && 'opacity-50',
        className,
      )}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLORS[variant]} />
      ) : (
        <Text className={cn('text-base font-inter-semibold', TEXT_CLASSES[variant])}>{children}</Text>
      )}
    </Pressable>
  )
}
