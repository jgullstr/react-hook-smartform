import { useMemo, type ReactNode } from 'react'
import { createScope, FormScopeContext, useFormScope, type FieldName, type FormScopeType } from './FormScopeContext'

export interface FormScopeProps {
  name: FieldName
  /** `'array'` when the children address rows by index. `<FieldArray>` sets this for you. */
  type?: FormScopeType
  children?: ReactNode
}

/** Prefixes the names of every field inside it. Scopes nest. */
export function FormScope({ name, type = 'object', children }: FormScopeProps) {
  const parent = useFormScope()
  const scope = useMemo(() => createScope(parent.getPath(name), type), [parent, name, type])
  return <FormScopeContext.Provider value={scope}>{children}</FormScopeContext.Provider>
}
