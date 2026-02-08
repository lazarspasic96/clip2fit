import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type FieldValues, type UseFormProps } from 'react-hook-form'
import type { z } from 'zod'

interface UseZodFormProps<TSchema extends z.ZodType<FieldValues, FieldValues>>
  extends Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'> {
  schema: TSchema
}

export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>({
  schema,
  ...formProps
}: UseZodFormProps<TSchema>) {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    resolver: zodResolver(schema),
    ...formProps,
  })
}
