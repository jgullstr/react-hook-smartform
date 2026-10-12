import { createContext, useContext, type BaseSyntheticEvent } from 'react'

/** What a form does when submitted. Usually `handleSubmit(onValid)` from react-hook-form. */
export type SmartFormSubmit = (event?: BaseSyntheticEvent) => Promise<void> | void

export const SubmitContext = createContext<SmartFormSubmit | null>(null)

/** The enclosing form's submit handler, for buttons that are not `type="submit"`. */
export function useSmartFormSubmit(): SmartFormSubmit {
  const submit = useContext(SubmitContext)
  if (submit === null) {
    throw new Error(
      'react-hook-smartform: no form. Call useSmartFormSubmit() inside <Form> or the Form returned by useSmartForm().',
    )
  }
  return submit
}
