import { createContext, useContext, type ReactNode } from 'react'
import type { FieldArrayMethodProps } from 'react-hook-form'

/** The property react-hook-form adds to each row of `fields` to key it. Never part of the values. */
export const FIELD_ARRAY_KEY = 'smartformKey'
export type FieldArrayKey = typeof FIELD_ARRAY_KEY

export type FieldArrayRow<TRow> = { readonly [FIELD_ARRAY_KEY]: string } & (TRow extends object ? TRow : unknown)

export interface FieldArrayContextValue<TRow = unknown> {
  /** Full path of the array. */
  readonly path: string
  readonly keyName: FieldArrayKey
  /** A snapshot per row, for keys and counts. Read live values through fields, not from here. */
  readonly fields: ReadonlyArray<FieldArrayRow<TRow>>
  append(value: TRow | TRow[], options?: FieldArrayMethodProps): void
  prepend(value: TRow | TRow[], options?: FieldArrayMethodProps): void
  insert(index: number, value: TRow | TRow[], options?: FieldArrayMethodProps): void
  remove(index?: number | number[]): void
  swap(indexA: number, indexB: number): void
  move(from: number, to: number): void
  update(index: number, value: TRow): void
  replace(value: TRow[]): void
  /** One node per row, keyed for React. `lastIndex` is `fields.length - 1`. */
  renderFields(render: (index: number, lastIndex: number) => ReactNode): ReactNode[]
}

export const FieldArrayContext = createContext<FieldArrayContextValue | null>(null)

/** The enclosing `<FieldArray>`: its rows, the methods to change them, and `renderFields`. */
export function useFieldArrayScope<TRow = unknown>(): FieldArrayContextValue<TRow> {
  const context = useContext(FieldArrayContext)
  if (context === null) {
    throw new Error('react-hook-smartform: no field array. Call useFieldArrayScope() inside <FieldArray>.')
  }
  return context as FieldArrayContextValue<TRow>
}
