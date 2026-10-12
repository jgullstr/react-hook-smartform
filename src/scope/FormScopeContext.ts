import { createContext, useContext } from 'react'

/** A field name relative to the enclosing scope. Numbers address the rows of an array scope. */
export type FieldName = string | number

export type FormScopeType = 'object' | 'array'

export interface FormScopeContextValue {
  /** Full dotted path of this scope. `undefined` at the form root. */
  readonly path: string | undefined
  readonly type: FormScopeType
  /** Resolves a name relative to this scope to the full path react-hook-form registers. */
  readonly getPath: (name: FieldName) => string
}

const integerName = /^\d+$/

/**
 * Joins a relative name onto a scope path.
 *
 * In an object scope a purely numeric name is refused: react-hook-form reads `items.0` as an
 * array index, so the value would land in an array instead of under the key the author meant.
 */
export function getScopedPath(parentPath: string | undefined, type: FormScopeType, name: FieldName): string {
  const segment = String(name)
  if (type === 'object' && integerName.test(segment)) {
    throw new TypeError(
      `react-hook-smartform: numeric field name "${segment}" in object scope "${parentPath ?? '(root)'}". ` +
        'Rows need <FieldArray> or <FormScope type="array">.',
    )
  }
  return parentPath === undefined ? segment : `${parentPath}.${segment}`
}

export function createScope(parentPath: string | undefined, type: FormScopeType): FormScopeContextValue {
  return {
    path: parentPath,
    type,
    getPath: (name) => getScopedPath(parentPath, type, name),
  }
}

export const rootScope: FormScopeContextValue = createScope(undefined, 'object')

export const FormScopeContext = createContext<FormScopeContextValue | null>(null)

/** The enclosing scope. Field components call `getPath(name)` on it to find where they register. */
export function useFormScope(): FormScopeContextValue {
  const scope = useContext(FormScopeContext)
  if (scope === null) {
    throw new Error(
      'react-hook-smartform: no form scope. Render this inside <Form> or the Form returned by useSmartForm().',
    )
  }
  return scope
}
