import { useFormContext } from 'react-hook-form'
import { useFormScope, type FieldName } from '../scope/FormScopeContext'
import { useScopedController, type UseScopedControllerProps } from '../scope/useScopedController'
import { getByPath } from '../utils/getByPath'
import { isEmptyValue } from '../utils/isEmptyValue'

export interface HiddenProps {
  name: FieldName
  /** Render (and register) nothing while the form has no value for the field. */
  unmountIfEmpty?: boolean
  rules?: UseScopedControllerProps<unknown>['rules']
  shouldUnregister?: boolean
}

function HiddenInput({ name, rules, shouldUnregister }: Omit<HiddenProps, 'unmountIfEmpty'>) {
  const {
    field: { value, name: path, ref },
  } = useScopedController<unknown>({ name, rules, shouldUnregister })
  // The DOM input mirrors the value for native form APIs; the form value itself keeps its type.
  return <input type="hidden" name={path} ref={ref} value={isEmptyValue(value) ? '' : String(value)} />
}

/** Keeps a value (an id, say) in the submission without rendering a visible field. */
export function Hidden({ unmountIfEmpty = false, ...props }: HiddenProps) {
  const { getPath } = useFormScope()
  const {
    getValues,
    formState: { defaultValues },
  } = useFormContext()

  if (unmountIfEmpty) {
    // With shouldUnregister the form's values start empty, so an unmounted field's value lives in
    // defaultValues; a row that was appended has it in the values. Look in both.
    const path = getPath(props.name)
    const value = getValues(path) ?? getByPath(defaultValues, path)
    if (isEmptyValue(value)) return null
  }
  return <HiddenInput {...props} />
}
