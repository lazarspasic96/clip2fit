import { Controller, useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'
import { Label } from './label'
import { RadioGroup } from './radio-group'

interface FormRadioGroupProps<T extends string> {
  name: string
  label?: string
  required?: boolean
  options: { label: string; value: T }[]
}

export const FormRadioGroup = <T extends string>({
  name,
  label,
  required,
  options,
}: FormRadioGroupProps<T>) => {
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
        render={({ field: { onChange, value } }) => (
          <RadioGroup options={options} value={value} onChange={onChange} />
        )}
      />
      {errorMessage && <Text className="text-xs font-inter text-content-badge-error">{errorMessage}</Text>}
    </View>
  )
}
