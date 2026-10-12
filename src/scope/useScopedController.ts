import {
  useController,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type UseControllerProps,
  type UseFormStateReturn,
} from 'react-hook-form'
import { useFormScope, type FieldName } from './FormScopeContext'

export interface UseScopedControllerProps<TValue> {
  /** Relative to the enclosing scope. */
  name: FieldName
  /** Used when the form's defaultValues hold nothing for this field. */
  defaultValue?: TValue
  /**
   * What `field.value` reports while the form holds no value and no default applies: a display
   * fallback that keeps the input controlled; the field is still registered and submits
   * `undefined`. Only a field without `defaultValue` (and without a form default) ever shows it,
   * because react-hook-form falls back to a default whenever one exists. Defaults to `defaultValue`.
   */
  emptyValue?: TValue
  rules?: UseControllerProps<FieldValues, string>['rules']
  disabled?: boolean
  shouldUnregister?: boolean
}

export interface ScopedField<TValue> extends Omit<ControllerRenderProps<FieldValues, string>, 'value'> {
  value: TValue
}

export interface UseScopedControllerReturn<TValue> {
  field: ScopedField<TValue>
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<FieldValues>
}

/**
 * `useController` for a field named relative to the enclosing scope.
 *
 * `field.value` is typed by `defaultValue`/`emptyValue`; give one of them and the value is never
 * `undefined`. The form's defaultValues still win over `defaultValue`, as in react-hook-form.
 */
export function useScopedController<TValue>(
  props: UseScopedControllerProps<TValue> & ({ defaultValue: TValue } | { emptyValue: TValue }),
): UseScopedControllerReturn<TValue>
export function useScopedController<TValue = unknown>(
  props: UseScopedControllerProps<TValue>,
): UseScopedControllerReturn<TValue | undefined>
export function useScopedController<TValue>({
  name,
  defaultValue,
  emptyValue = defaultValue,
  rules,
  disabled,
  shouldUnregister,
}: UseScopedControllerProps<TValue>): UseScopedControllerReturn<TValue | undefined> {
  const { getPath } = useFormScope()
  const { field, fieldState, formState } = useController<FieldValues, string>({
    name: getPath(name),
    defaultValue,
    rules,
    disabled,
    shouldUnregister,
  })
  return {
    field: { ...field, value: field.value === undefined ? emptyValue : (field.value as TValue) },
    fieldState,
    formState,
  }
}
