import { Controller, useFormContext } from 'react-hook-form'
import { SegmentedControl } from './segmented-control'

interface FormSegmentedControlProps<T extends string> {
  name: string
  options: { label: string; value: T }[]
}

export const FormSegmentedControl = <T extends string>({
  name,
  options,
}: FormSegmentedControlProps<T>) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <SegmentedControl options={options} value={value} onChange={onChange} />
      )}
    />
  )
}
