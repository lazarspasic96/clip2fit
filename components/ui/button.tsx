import { ActivityIndicator, Pressable, Text } from 'react-native'

import { Colors } from '@/constants/colors'

import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  children: string
  variant?: ButtonVariant
  className?: string
}

const SPINNER_COLORS: Record<ButtonVariant, string> = {
  primary: Colors.content.buttonPrimary,
  secondary: Colors.content.primary,
  ghost: Colors.content.secondary,
}

export const Button = ({
  onPress,
  loading,
  disabled,
  children,
  variant = 'primary',
  className,
}: ButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'items-center justify-center rounded-md py-3.5',
        variant === 'primary' && 'bg-background-button-primary',
        variant === 'secondary' && 'bg-background-button-secondary border border-border-primary',
        variant === 'ghost' && 'bg-transparent',
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLORS[variant]} />
      ) : (
        <Text
          className={cn(
            'text-base font-inter-semibold',
            variant === 'primary' && 'text-content-button-primary',
            variant === 'secondary' && 'text-content-primary',
            variant === 'ghost' && 'text-content-secondary',
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}
