import { Controller, useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'
import { Input, type InputProps } from './input'
import { Label } from './label'

interface FormInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  name: string
  label?: string
  required?: boolean
  showError?: boolean
}

export function FormInput({ name, label, required, showError = true, ...inputProps }: FormInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const errorMessage = errors[name]?.message as string | undefined

  return (
    <View className="gap-1.5">
      {label && <Label text={label} required={required} />}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input value={value} onChangeText={onChange} onBlur={onBlur} error={!!errorMessage} {...inputProps} />
        )}
      />
      {showError && errorMessage && <Text className="text-xs font-inter text-content-badge-error">{errorMessage}</Text>}
    </View>
  )
}
