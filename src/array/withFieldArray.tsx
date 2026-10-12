import type { ComponentType } from 'react'
import { FieldArray, type FieldArrayProps } from './FieldArray'
import type { FieldName } from '../scope/FormScopeContext'

/** Wraps a component that renders rows so `<Rows name="addresses" />` is its own `<FieldArray>`. */
export function withFieldArray<P extends { name: FieldName }>(
  Component: ComponentType<P>,
  options?: Omit<FieldArrayProps, 'name' | 'children'>,
) {
  function WithFieldArray(props: P) {
    return (
      <FieldArray name={props.name} {...options}>
        <Component {...props} />
      </FieldArray>
    )
  }
  WithFieldArray.displayName = `withFieldArray(${Component.displayName ?? Component.name})`
  return WithFieldArray
}
