import { useCallback, useLayoutEffect, useRef, type BaseSyntheticEvent } from 'react'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useFormPropKeys, type UseFormPropKey } from './useFormPropKeys'
import { useSmartForm, type SmartFormElementProps } from './useSmartForm'

export type SmartFormSubmitHandler<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = (
  values: TTransformedValues,
  event: BaseSyntheticEvent | undefined,
  methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
) => unknown

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> extends Omit<SmartFormElementProps, 'onSubmit'>,
    UseFormProps<TFieldValues, TContext, TTransformedValues> {
  /** Called with valid values. Return a promise to keep `formState.isSubmitting` on until it settles. */
  onSubmit: SmartFormSubmitHandler<TFieldValues, TContext, TTransformedValues>
}

const isUseFormPropKey = (key: string): key is UseFormPropKey =>
  (useFormPropKeys as ReadonlyArray<string>).includes(key)

function splitProps<TFieldValues extends FieldValues, TContext, TTransformedValues>(
  props: Omit<FormProps<TFieldValues, TContext, TTransformedValues>, 'onSubmit' | 'children'>,
): [UseFormProps<TFieldValues, TContext, TTransformedValues>, Omit<SmartFormElementProps, 'onSubmit' | 'children'>] {
  const useFormProps: Record<string, unknown> = {}
  const elementProps: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    ;(isUseFormPropKey(key) ? useFormProps : elementProps)[key] = value
  }
  return [
    useFormProps as UseFormProps<TFieldValues, TContext, TTransformedValues>,
    elementProps as Omit<SmartFormElementProps, 'onSubmit' | 'children'>,
  ]
}

/**
 * A form in one element: react-hook-form's options and the form element's attributes side by side.
 *
 * Validates on change and leaves unmounted fields out of the submission unless told otherwise.
 */
export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>({ onSubmit, children, ...rest }: FormProps<TFieldValues, TContext, TTransformedValues>) {
  const [useFormProps, elementProps] = splitProps(rest)
  const methods = useSmartForm<TFieldValues, TContext, TTransformedValues>({
    mode: 'onChange',
    shouldUnregister: true,
    ...useFormProps,
  })
  const { Form: SmartForm, handleSubmit } = methods

  // The submit handler keeps one identity (consumers of useSmartFormSubmit do not re-render for
  // it) while always calling the onSubmit of the latest render.
  const onSubmitRef = useRef(onSubmit)
  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit
  })
  const submit = useCallback(
    (event?: BaseSyntheticEvent) =>
      // Awaiting inside keeps isSubmitting on for a returned promise, and resolving to void keeps
      // the handler a SmartFormSubmit: newer react-hook-form resolves handleSubmit to onSubmit's result.
      handleSubmit(async (values, e) => {
        await onSubmitRef.current(values, e, methods)
      })(event),
    [handleSubmit, methods],
  )

  return (
    <SmartForm {...elementProps} onSubmit={submit}>
      {children}
    </SmartForm>
  )
}
