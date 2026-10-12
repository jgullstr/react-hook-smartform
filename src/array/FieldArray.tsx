import { Fragment, useMemo, type ReactNode } from 'react'
import { useFieldArray, type FieldValues, type UseFieldArrayProps } from 'react-hook-form'
import { FIELD_ARRAY_KEY, FieldArrayContext, type FieldArrayContextValue, type FieldArrayKey } from './FieldArrayContext'
import { createScope, FormScopeContext, useFormScope, type FieldName } from '../scope/FormScopeContext'

export interface FieldArrayProps {
  name: FieldName
  rules?: UseFieldArrayProps<FieldValues, string, FieldArrayKey>['rules']
  shouldUnregister?: boolean
  children?: ReactNode
}

/**
 * An array scope: inside it, numeric names address rows. Rows of objects wrap their fields in
 * `<FormScope name={index}>`; rows of plain values use `name={index}` directly.
 */
export function FieldArray({ name, rules, shouldUnregister, children }: FieldArrayProps) {
  const parent = useFormScope()
  const path = parent.getPath(name)
  const scope = useMemo(() => createScope(path, 'array'), [path])

  const { fields, append, prepend, insert, remove, swap, move, update, replace } = useFieldArray<
    FieldValues,
    string,
    FieldArrayKey
  >({ name: path, keyName: FIELD_ARRAY_KEY, rules, shouldUnregister })

  const value = useMemo<FieldArrayContextValue>(
    () => ({
      path,
      keyName: FIELD_ARRAY_KEY,
      fields,
      append,
      prepend,
      insert,
      remove,
      swap,
      move,
      update,
      replace,
      renderFields: (render) => {
        const lastIndex = fields.length - 1
        return fields.map((field, index) => <Fragment key={field[FIELD_ARRAY_KEY]}>{render(index, lastIndex)}</Fragment>)
      },
    }),
    [path, fields, append, prepend, insert, remove, swap, move, update, replace],
  )

  return (
    <FormScopeContext.Provider value={scope}>
      <FieldArrayContext.Provider value={value}>{children}</FieldArrayContext.Provider>
    </FormScopeContext.Provider>
  )
}
