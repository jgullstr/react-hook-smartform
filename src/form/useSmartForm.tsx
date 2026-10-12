import { useCallback, useMemo, type BaseSyntheticEvent, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { FormProvider, useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form'
import { FormScopeContext, rootScope } from '../scope/FormScopeContext'
import { SubmitContext, type SmartFormSubmit } from './SubmitContext'

export interface SmartFormElementProps extends Omit<ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  /** Usually `handleSubmit(onValid)`. Descendants get it back from `useSmartFormSubmit()`. */
  onSubmit: SmartFormSubmit
  children?: ReactNode
}

/** The `<form>` element `useSmartForm` returns. */
export type SmartFormElement = (props: SmartFormElementProps) => ReactNode

// The defaults mirror react-hook-form's own, including TContext = any, so the two sets of types line up.
export type UseSmartFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = UseFormProps<TFieldValues, TContext, TTransformedValues>

export interface UseSmartFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> extends UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  /**
   * A `<form>` that provides react-hook-form's context, the root scope and the submit handler
   * to everything inside it. The same component on every render, so children keep their state.
   */
  Form: SmartFormElement
}

/** `useForm` plus a `Form` element that wires the context up. */
export function useSmartForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  props?: UseSmartFormProps<TFieldValues, TContext, TTransformedValues>,
): UseSmartFormReturn<TFieldValues, TContext, TTransformedValues> {
  const methods = useForm<TFieldValues, TContext, TTransformedValues>(props)

  // useForm returns one object for the life of the form and only swaps its formState property each
  // render, so a component closed over `methods` sees fresh state while keeping its own identity.
  const Form = useMemo<SmartFormElement>(
    () =>
      function SmartForm({ onSubmit, children, ...formProps }: SmartFormElementProps) {
        // Stable while onSubmit is, so useSmartFormSubmit() consumers do not re-render for it.
        const submit = useCallback(
          (event?: BaseSyntheticEvent) => {
            // A form shown through a portal is still a React descendant of whatever it was opened
            // from; without this a dialog's submit would also submit the page's form. A click handed in
            // by a button keeps bubbling.
            if (event?.type === 'submit') event.stopPropagation()
            return onSubmit(event)
          },
          [onSubmit],
        )
        return (
          <FormProvider {...methods}>
            <FormScopeContext.Provider value={rootScope}>
              <SubmitContext.Provider value={submit}>
                <form {...formProps} onSubmit={submit}>
                  {children}
                </form>
              </SubmitContext.Provider>
            </FormScopeContext.Provider>
          </FormProvider>
        )
      },
    [methods],
  )

  // Spreading `methods` once would freeze formState at that render; a getter keeps it live while
  // the returned object stays the same across renders, like useForm's own.
  return useMemo(() => {
    const { formState: _, ...stable } = methods
    void _
    return Object.defineProperty({ ...stable, Form }, 'formState', {
      enumerable: true,
      get: () => methods.formState,
    }) as UseSmartFormReturn<TFieldValues, TContext, TTransformedValues>
  }, [methods, Form])
}
