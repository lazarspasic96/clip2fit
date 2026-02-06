import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormProps } from 'react-hook-form'
import type { ZodType, output } from 'zod'

interface UseZodFormProps<Z extends ZodType> extends Omit<UseFormProps<output<Z>>, 'resolver'> {
  schema: Z
}

export function useZodForm<Z extends ZodType>({ schema, ...formProps }: UseZodFormProps<Z>) {
  return useForm<output<Z>>({
    resolver: zodResolver(schema),
    ...formProps,
  })
}
