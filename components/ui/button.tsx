import { ActivityIndicator, Pressable, Text } from 'react-native'

import { Colors } from '@/constants/colors'

import { cn } from './cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'default' | 'sm'

interface ButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  children: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  textClassName?: string
}

const SPINNER_COLORS: Record<ButtonVariant, string> = {
  primary: Colors.content.buttonPrimary,
  secondary: Colors.brand.accent,
  ghost: Colors.content.secondary,
}

export const Button = ({
  onPress,
  loading,
  disabled,
  children,
  variant = 'primary',
  size = 'default',
  className,
  textClassName,
}: ButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'items-center justify-center rounded-3xl',
        size === 'default' && 'py-3.5',
        size === 'sm' && 'py-2 px-4',
        variant === 'primary' && 'bg-background-button-primary',
        variant === 'secondary' && 'bg-background-button-secondary border border-border-primary px-4',
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
            variant === 'secondary' && 'text-brand-accent',
            variant === 'ghost' && 'text-content-secondary',
            textClassName,
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}
