import type { BaseSyntheticEvent } from 'react'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'
import { expectTypeOf } from 'vitest'
import {
  Form,
  useFieldArrayScope,
  useScopedController,
  useSmartForm,
  type FieldArrayContextValue,
  type FormProps,
  type SmartFormSubmitHandler,
} from './index'
import type { UseFormPropKey } from './form/useFormPropKeys'

// <Form> splits props on useFormPropKeys; this fails to compile when react-hook-form adds a key.
expectTypeOf<Exclude<keyof UseFormProps, UseFormPropKey>>().toEqualTypeOf<never>()

interface Client {
  name: string
  tags: string[]
}

// onSubmit is typed by the form's values and gets the methods for the same values.
const handler: SmartFormSubmitHandler<Client> = (values, event, methods) => {
  expectTypeOf(values).toEqualTypeOf<Client>()
  expectTypeOf(event).toEqualTypeOf<BaseSyntheticEvent | undefined>()
  expectTypeOf(methods).toEqualTypeOf<UseFormReturn<Client, any, Client>>()
}
void handler

// Form element attributes and useForm options sit side by side.
expectTypeOf<FormProps<Client>['className']>().toEqualTypeOf<string | undefined>()
expectTypeOf<FormProps<Client>['mode']>().toEqualTypeOf<UseFormProps<Client>['mode']>()
// @ts-expect-error — onSubmit is required.
const _missingSubmit: FormProps<Client> = {}
void _missingSubmit
void Form

// useSmartForm returns useForm's methods plus Form.
declare const smart: ReturnType<typeof useSmartForm<Client>>
expectTypeOf(smart.handleSubmit).toEqualTypeOf<UseFormReturn<Client>['handleSubmit']>()
expectTypeOf(smart.Form).parameter(0).toHaveProperty('onSubmit')

// useScopedController: a default or empty value fixes the value type and removes undefined.
declare function inForm<T>(fn: () => T): T
expectTypeOf(inForm(() => useScopedController({ name: 'x', defaultValue: '' }).field.value)).toEqualTypeOf<string>()
expectTypeOf(inForm(() => useScopedController({ name: 'x', emptyValue: 0 }).field.value)).toEqualTypeOf<number>()
expectTypeOf(inForm(() => useScopedController<boolean>({ name: 'x' }).field.value)).toEqualTypeOf<boolean | undefined>()
expectTypeOf(inForm(() => useScopedController({ name: 'x' }).field.value)).toEqualTypeOf<unknown>()
expectTypeOf(inForm(() => useScopedController({ name: 0, defaultValue: '' }).field.name)).toEqualTypeOf<string>()
// @ts-expect-error — defaultValue and emptyValue must agree.
inForm(() => useScopedController({ name: 'x', defaultValue: '', emptyValue: 0 }))

// Field array rows are typed by the caller; plain rows do not gain object keys.
type AddressRows = FieldArrayContextValue<{ street: string }>
expectTypeOf<AddressRows['fields'][number]>().toEqualTypeOf<{ readonly smartformKey: string } & { street: string }>()
expectTypeOf<AddressRows['append']>().parameter(0).toEqualTypeOf<{ street: string } | { street: string }[]>()
type TagRows = FieldArrayContextValue<string>
expectTypeOf<TagRows['fields'][number]>().toEqualTypeOf<{ readonly smartformKey: string }>()
expectTypeOf(inForm(() => useFieldArrayScope<string>().append)).parameter(0).toEqualTypeOf<string | string[]>()
