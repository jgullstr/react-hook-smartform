import type { ReactNode } from 'react'
import { useFormState } from 'react-hook-form'
import type { FieldName } from '../scope/FormScopeContext'
import { useScopedController, type UseScopedControllerProps } from '../scope/useScopedController'

export interface InputProps {
  name: FieldName
  label: string
  rules?: UseScopedControllerProps<string>['rules']
  type?: string
}

/** A text field the way the README recipe writes one. */
export function Input({ name, label, rules, type = 'text' }: InputProps) {
  const { field, fieldState } = useScopedController({ name, defaultValue: '', rules })
  // The message sits outside the label so it does not become part of the field's label text.
  return (
    <>
      <label>
        {label}
        <input type={type} {...field} aria-invalid={fieldState.invalid || undefined} />
      </label>
      {fieldState.error ? <span role="alert">{fieldState.error.message}</span> : null}
    </>
  )
}

export function Checkbox({ name, label }: { name: FieldName; label: string }) {
  const {
    field: { value, onChange, ...field },
  } = useScopedController({ name, defaultValue: false })
  return (
    <label>
      {label}
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} {...field} />
    </label>
  )
}

export function SubmitButton({ children = 'Save' }: { children?: ReactNode }) {
  const { isSubmitting } = useFormState()
  return (
    <button type="submit" disabled={isSubmitting}>
      {children}
    </button>
  )
}
