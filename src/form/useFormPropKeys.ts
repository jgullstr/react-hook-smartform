import type { UseFormProps } from 'react-hook-form'

/**
 * Every key of react-hook-form's UseFormProps. `<Form>` sends these to useForm and everything
 * else to the <form> element. `types.test-d.ts` stops compiling if react-hook-form adds a key
 * this list lacks.
 */
export const useFormPropKeys = [
  'mode',
  'reValidateMode',
  'defaultValues',
  'values',
  'errors',
  'resetOptions',
  'resolver',
  'context',
  'shouldFocusError',
  'shouldUnregister',
  'shouldUseNativeValidation',
  'progressive',
  'criteriaMode',
  'delayError',
  'disabled',
  'formControl',
  'validate',
] as const satisfies ReadonlyArray<keyof UseFormProps>

export type UseFormPropKey = (typeof useFormPropKeys)[number]
