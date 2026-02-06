# Form Components Implementation Plan

## Context

clip2fit needs reusable form primitives following the jolli-mobile 2-layer pattern: **base UI components** (pure presentational) + **form components** (react-hook-form Controller wrappers with error display). Currently only `components/auth/auth-input.tsx` and `auth-button.tsx` exist. Form libs (react-hook-form, zod, @hookform/resolvers) already installed.

## Dependencies to Install

```bash
npm install tailwind-merge clsx @react-native-picker/picker
npx expo install @react-native-picker/picker   # if needed for Expo compat
```

## File Structure

```
components/ui/
  cn.ts                  # twMerge + clsx utility
  label.tsx              # Reusable label component
  input.tsx              # Base text input
  checkbox.tsx           # Base checkbox
  radio-group.tsx        # RadioGroup + RadioOption (context-based)
  select.tsx             # Base select (@react-native-picker/picker)
  switch.tsx             # Base toggle switch
  form-input.tsx         # Input + Controller + error
  form-checkbox.tsx      # Checkbox + Controller + error
  form-radio-group.tsx   # RadioGroup + Controller + error
  form-select.tsx        # Select + Controller + error
  form-switch.tsx        # Switch + Controller + error

hooks/
  use-zod-form.ts        # useForm + zodResolver wrapper
```

## Phase 1: Foundation

### cn.ts

```ts
export function cn(...inputs: ClassValue[]): string
```

Combines clsx + twMerge for conditional Tailwind class composition.

### label.tsx

**Props**: `{ text: string; required?: boolean; className?: string }`

- `text-sm font-inter-medium text-content-secondary`
- Optional red `*` for required fields
- Used by all form components for consistent label rendering

### use-zod-form.ts

```ts
export function useZodForm<Z extends ZodSchema>({ schema, ...formProps }: UseZodFormProps<Z>)
```

Exact pattern from jolli-mobile. Wraps `useForm` with `zodResolver`.

## Phase 2: Base Components

All base components follow clip2fit's dark theme (zinc + lime) from `tailwind.config.js`. Icons from `lucide-react-native`.

### input.tsx

**Props**: `TextInputProps & { error?: boolean; secureTextEntry?: boolean; disabled?: boolean; className?: string }`

- Focus state: `border-brand-accent`
- Error state: `border-content-badge-error`
- Default: `border-border-primary`, `bg-background-secondary`
- Password toggle: Eye/EyeOff icons (reuse AuthInput pattern)
- Disabled: `opacity-50`, non-interactive

### checkbox.tsx

**Props**: `{ checked: boolean; onCheckedChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean; className?: string }`

- 20x20 Pressable box, `rounded-sm`
- Checked: `bg-brand-accent` + dark Check icon
- Unchecked: `border-border-secondary`, transparent
- Label rendered to the right

### radio-group.tsx

**Exports**: `RadioGroup` (context provider) + `RadioOption`

**RadioGroup Props**: `{ value: string; onValueChange: (v: string) => void; className?: string; children: ReactNode }`
**RadioOption Props**: `{ value: string; label: string; disabled?: boolean; className?: string }`

- Context shares selected value to children
- 20x20 circle, `rounded-full`
- Selected: `border-brand-accent` + inner filled circle `bg-brand-accent`
- Unselected: `border-border-secondary`

### select.tsx

**Props**: `{ value: string; onValueChange: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string; disabled?: boolean; error?: boolean; className?: string }`

- Uses `@react-native-picker/picker` for native feel
- Wrapped in themed container matching Input style (`bg-background-secondary`, `border-border-primary`, `rounded-md`)
- Text color: `text-content-primary`, placeholder: `text-content-tertiary`
- Error/focus border states matching Input

### switch.tsx

**Props**: `{ checked: boolean; onCheckedChange: (v: boolean) => void; label?: string; disabled?: boolean; className?: string }`

- RN Switch component with themed colors
- trackColor: unchecked `#3f3f46` (zinc-700), checked `#84cc16` (lime-500)
- thumbColor: `#fafafa`
- Label to the left, switch to the right (flex-row justify-between)

## Phase 3: Form Components

All form components follow identical pattern from jolli-mobile:

```tsx
const { control, formState: { errors } } = useFormContext()
const errorMessage = errors[name]?.message as string | undefined

return (
  <View>
    {label && <Label text={label} />}
    <Controller control={control} name={name} render={({ field }) => <BaseComponent ... />} />
    {showError && errorMessage && <Text className="text-xs text-content-badge-error mt-1.5">{errorMessage}</Text>}
  </View>
)
```

### form-input.tsx

**Props**: `{ name: string; label?: string; showError?: boolean } & Omit<InputProps, 'value' | 'onChangeText'>`

### form-checkbox.tsx

**Props**: `{ name: string; label?: ReactNode; showError?: boolean } & Omit<CheckboxProps, 'checked' | 'onCheckedChange'>`

### form-radio-group.tsx

**Props**: `{ name: string; label?: string; options: { label: string; value: string }[]; showError?: boolean; className?: string }`

### form-select.tsx

**Props**: `{ name: string; label?: string; showError?: boolean } & Omit<SelectProps, 'value' | 'onValueChange'>`

### form-switch.tsx

**Props**: `{ name: string; label?: string; showError?: boolean } & Omit<SwitchProps, 'checked' | 'onCheckedChange'>`

## Phase 4: Refactor Auth Screens

Refactor `app/(auth)/login.tsx` and `app/(auth)/signup.tsx`:

- Replace manual `Controller` wrappers with `FormInput`
- Replace `useForm` + `zodResolver` with `useZodForm`
- Wrap form content in `FormProvider`
- Keep `AuthButton` as-is (submit button, not a form field)
- Remove `AuthInput` after migration (replaced by `FormInput`)

## Implementation Order

1. Install deps (`tailwind-merge`, `clsx`, `@react-native-picker/picker`)
2. `cn.ts` + `label.tsx` + `use-zod-form.ts`
3. `input.tsx` → `form-input.tsx`
4. `checkbox.tsx` → `form-checkbox.tsx`
5. `switch.tsx` → `form-switch.tsx`
6. `radio-group.tsx` → `form-radio-group.tsx`
7. `select.tsx` → `form-select.tsx`
8. Refactor auth screens (login.tsx, signup.tsx)

## Verification

- Render all base components in various states (default, focused, error, disabled, checked)
- Test form integration: FormProvider + useZodForm + submit with validation errors
- Verify auth screens still work after refactor
- Run `npm run lint`
