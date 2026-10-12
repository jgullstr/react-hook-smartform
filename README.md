# react-hook-smartform

A thin layer over [react-hook-form](https://react-hook-form.com). It keeps react-hook-form's state, validation and submit handling, and adds three things: field components that register themselves, scopes that make field names relative, and field arrays that read like markup. You write a field component once and use it like this:

```tsx
<TextField name="phone" label="Phone" />
```

## Why

With react-hook-form alone, one text field reads like this. Illustrative: it uses the `Field` and `Input` components from a shadcn project.

<!-- illustrative -->
```tsx
<Controller
  name="phone"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="phone">Phone</FieldLabel>
      <Input {...field} id="phone" aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

With this package the same field is one line:

```tsx
<TextField name="phone" label="Phone" />
```

Three ideas make that possible.

- **Fields register themselves.** A field component calls `useScopedController` and finds its form through React context. You pass no `control` and write no render prop.
- **Names are relative.** Inside `<FormScope name="address">`, a field named `street` registers as `address.street`. A group of fields can then be reused under any key, or as the rows of an array.
- **Unmounted fields leave the submission.** `<Form>` turns react-hook-form's `shouldUnregister` on, so a field that is not on screen is not submitted. The submission holds what is mounted.

## Install

```sh
npm install react-hook-smartform react-hook-form
```

Version 8 is not on npm yet. Inside a pnpm workspace that contains the package, depend on it like this:

```json
"react-hook-smartform": "workspace:*"
```

Peer dependencies: `react` ^19 and `react-hook-form` ^7.77.0. `@types/react` ^19 is an optional peer for TypeScript projects. The package does not depend on `react-dom`. It ships as ES modules only, with its type declarations.

## Quick start

A field component, a value type and a form. The examples in this README build on each other: the first block of each section imports only what that section adds.

```tsx
import { useId } from 'react'
import {
  Form,
  useScopedController,
  type FieldName,
  type SmartFormSubmitHandler,
  type UseScopedControllerProps,
} from 'react-hook-smartform'

interface TextFieldProps {
  name: FieldName
  label: string
  rules?: UseScopedControllerProps<string>['rules']
}

function TextField({ name, label, rules }: TextFieldProps) {
  const { field, fieldState } = useScopedController({ name, defaultValue: '', rules })
  const errorId = useId()
  return (
    <div>
      <label>
        {label}
        <input
          {...field}
          // Loaded data can hold null, which emptyValue does not replace, and an input needs a string.
          value={field.value ?? ''}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={fieldState.error ? errorId : undefined}
        />
      </label>
      {fieldState.error ? (
        <p id={errorId} role="alert">
          {fieldState.error.message}
        </p>
      ) : null}
    </div>
  )
}

interface Client {
  name: string
  phone: string
}

function ClientForm({ client, save }: { client: Client; save: SmartFormSubmitHandler<Client> }) {
  return (
    <Form<Client> values={client} onSubmit={save}>
      <TextField name="name" label="Name" rules={{ required: 'Enter a name.' }} />
      <TextField name="phone" label="Phone" />
      <button type="submit">Save</button>
    </Form>
  )
}
```

`ClientForm` shows `client` and calls `save` with `{ name, phone }` when the user submits. The name field must not be empty; its message appears below it as the user types. `TextField` gives `defaultValue: ''`, so its input is controlled from the first render.

## Writing a field

A field component calls `useScopedController` with a name relative to the enclosing scope. It gets react-hook-form's `field`, `fieldState` and `formState` back, as from `useController`. Spread `field` on the input. This is the `TextField` from the quick start:

```tsx
interface TextFieldProps {
  name: FieldName
  label: string
  rules?: UseScopedControllerProps<string>['rules']
}

function TextField({ name, label, rules }: TextFieldProps) {
  const { field, fieldState } = useScopedController({ name, defaultValue: '', rules })
  const errorId = useId()
  return (
    <div>
      <label>
        {label}
        <input
          {...field}
          // Loaded data can hold null, which emptyValue does not replace, and an input needs a string.
          value={field.value ?? ''}
          aria-invalid={fieldState.invalid || undefined}
          aria-describedby={fieldState.error ? errorId : undefined}
        />
      </label>
      {fieldState.error ? (
        <p id={errorId} role="alert">
          {fieldState.error.message}
        </p>
      ) : null}
    </div>
  )
}
```

- Put the error element outside the `<label>`. Inside it, the error text would become part of the input's accessible name.
- Link the error to the input with `aria-describedby`, using an id from `useId()`. Set `aria-invalid` while the field is invalid.
- `rules` are react-hook-form's validation rules (`required`, `pattern`, `validate` and the rest), in the shape `useController` takes them.

A field for another kind of value gives its own `defaultValue`. `<Switch name="newsletter" label="Newsletter" />` submits `true` or `false`:

```tsx
function Switch({ name, label }: { name: FieldName; label: string }) {
  const {
    field: { value, onChange, ...field },
  } = useScopedController({ name, defaultValue: false })
  return (
    <label>
      <input {...field} type="checkbox" role="switch" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
```

The same recipe with shadcn's `Field` components. Illustrative: it uses the `Field` components from a shadcn project and is not compiled with the other examples.

<!-- illustrative -->
```tsx
import { useId } from 'react'
import { useScopedController, type FieldName } from 'react-hook-smartform'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function TextField({ name, label }: { name: FieldName; label: string }) {
  const { field, fieldState } = useScopedController({ name, defaultValue: '' })
  const inputId = useId()
  const errorId = useId()
  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        {...field}
        id={inputId}
        aria-invalid={fieldState.invalid}
        aria-describedby={fieldState.error ? errorId : undefined}
      />
      <FieldError id={errorId} errors={[fieldState.error]} />
    </Field>
  )
}
```

### Defaults and `emptyValue`

- `defaultValue` applies when the form's `values` or `defaultValues` hold nothing for the field. The form's value wins, as in react-hook-form.
- react-hook-form falls back to a default whenever one exists. So `field.value` is `undefined` only for a field without a default, neither `defaultValue` nor a form default, in three cases: the data never held a value for it, someone called `setValue(name, undefined)` on it, or it sits in an array row that was appended without its key.
- `emptyValue` is what `field.value` reports in those cases. It keeps the input controlled. It is a display fallback only: the field is still registered, and it is submitted with the value `undefined`. It defaults to `defaultValue`.
- `null` is a value, not empty. `emptyValue` does not replace it, so guard nullable data in the field component, as `TextField` does with `field.value ?? ''`.
- Give `defaultValue` or `emptyValue` and `field.value` has the type you gave, without `undefined`. Give neither and it is `TValue | undefined`.

## Scopes

`<FormScope name>` prefixes the names of every field inside it. This field registers as `address.street`:

```tsx
import { FormScope } from 'react-hook-smartform'

function ClientAddress() {
  return (
    <FormScope name="address">
      <TextField name="street" label="Street" />
    </FormScope>
  )
}
```

A component that renders fields does not know where it sits. Put it under a scope to place it. `AddressFields` serves both addresses here, and the submission is `{ billing: { street, city }, shipping: { street, city } }`:

```tsx
interface Address {
  street: string
  city: string
}

function AddressFields() {
  return (
    <>
      <TextField name="street" label="Street" />
      <TextField name="city" label="City" />
    </>
  )
}

interface Order {
  billing: Address
  shipping: Address
}

function OrderForm({ save }: { save: SmartFormSubmitHandler<Order> }) {
  return (
    <Form<Order> onSubmit={save}>
      <fieldset>
        <legend>Billing address</legend>
        <FormScope name="billing">
          <AddressFields />
        </FormScope>
      </fieldset>
      <fieldset>
        <legend>Shipping address</legend>
        <FormScope name="shipping">
          <AddressFields />
        </FormScope>
      </fieldset>
      <button type="submit">Order</button>
    </Form>
  )
}
```

- Scopes nest. Each one adds its name to the path with a dot.
- A dotted name is allowed. `<TextField name="address.street" label="Street" />` registers the same path as the first example.
- A purely numeric name, such as `name="0"` or `name={0}`, throws in an object scope. react-hook-form reads `items.0` as an array index, so the value would land in an array instead of under the key you meant. Numeric names address rows, inside `<FieldArray>` or `<FormScope type="array">`.
- `useFormScope().getPath(name)` returns the full path for a relative name, for example to pass to react-hook-form's `useWatch`.

## Field arrays

`<FieldArray name>` runs react-hook-form's `useFieldArray` for that name and opens an array scope. Inside it, `useFieldArrayScope<TRow>()` returns the rows and the methods that change them. `withFieldArray` wraps a component so that `<Addresses name="addresses" />` is its own `<FieldArray>`:

```tsx
import { FieldArray, useFieldArrayScope, withFieldArray } from 'react-hook-smartform'

function AddressRows() {
  const { renderFields, append, remove, move } = useFieldArrayScope<Address>()
  return (
    <>
      <ol>
        {renderFields((index, lastIndex) => (
          <li aria-label={`Address ${index + 1}`}>
            <FormScope name={index}>
              <AddressFields />
            </FormScope>
            <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
              Up
            </button>
            <button type="button" disabled={index === lastIndex} onClick={() => move(index, index + 1)}>
              Down
            </button>
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => append({ street: '', city: '' })}>
        Add address
      </button>
    </>
  )
}

const Addresses = withFieldArray(AddressRows)
```

Rows of plain values use the index as the field name:

```tsx
function TagRows() {
  const { renderFields, append } = useFieldArrayScope<string>()
  return (
    <>
      {renderFields((index) => (
        <TextField name={index} label={`Tag ${index + 1}`} />
      ))}
      <button type="button" onClick={() => append('')}>
        Add tag
      </button>
    </>
  )
}
```

A form with both:

```tsx
interface Contact {
  addresses: Address[]
  tags: string[]
}

function ContactForm({ contact, save }: { contact: Contact; save: SmartFormSubmitHandler<Contact> }) {
  return (
    <Form<Contact> values={contact} onSubmit={save}>
      <Addresses name="addresses" />
      <FieldArray name="tags">
        <TagRows />
      </FieldArray>
      <button type="submit">Save</button>
    </Form>
  )
}
```

- `renderFields((index, lastIndex) => …)` renders one node per row, keyed for React. `lastIndex` is `fields.length - 1`.
- Rows of objects wrap their fields in `<FormScope name={index}>`. Rows of plain values pass the index straight to the field: `name={index}`. react-hook-form documents flat arrays as unsupported for `useFieldArray`. This package's tests cover them on both supported react-hook-form versions.
- Arrays nest. A `<FieldArray name="phones">` inside a row scope edits the `phones` array of that row.
- `fields` are snapshots, taken when the array last changed. Each entry has a `smartformKey` string (`FIELD_ARRAY_KEY`) for React keys. An entry for a row of objects also holds the row as it was. An entry for a row of plain values carries only the key. The key appears on `fields` entries only, never in the values. Read live values through field components or `useWatch`.
- Do not change `name` while the array is mounted. To point the array elsewhere, remount it with a `key`.
- With `values` and `shouldUnregister` on, an array that has no rows is left out of the submission: no mounted field holds it. Treat a missing array as empty when you read the submission, or load the form with `defaultValues`.

## Submitting

`onSubmit` receives `(values, event, methods)`. `values` are the validated values. `event` is the submit event, or `undefined` when you call the submit handler yourself. `methods` is what react-hook-form's `useForm` returns, so `setError`, `reset` and the rest are at hand. This form maps the error codes a server returns to messages on the fields:

```tsx
import { useFormState } from 'react-hook-form'
import { useSmartFormSubmit } from 'react-hook-smartform'

// How the server refuses a value.
interface ServerError {
  field: keyof Client
  code: 'taken' | 'invalid'
}

const messages: Record<ServerError['code'], string> = {
  taken: 'Already in use.',
  invalid: 'Check this value.',
}
```

```tsx
function NewClientForm({ saveClient }: { saveClient: (client: Client) => Promise<ServerError[]> }) {
  return (
    <Form<Client>
      onSubmit={async (values, _event, { setError }) => {
        const errors = await saveClient(values)
        for (const { field, code } of errors) {
          setError(field, { message: messages[code] })
        }
      }}
    >
      <ToolbarSave />
      <TextField name="name" label="Name" />
      <TextField name="phone" label="Phone" />
      <SaveButton />
    </Form>
  )
}
```

`SaveButton` reads `isSubmitting` from react-hook-form's `useFormState()`. `ToolbarSave` is a control that is not a submit button:

```tsx
function SaveButton() {
  const { isSubmitting } = useFormState()
  return (
    <button type="submit" disabled={isSubmitting}>
      Save
    </button>
  )
}

function ToolbarSave() {
  const submit = useSmartFormSubmit()
  return (
    <button type="button" onClick={() => submit()}>
      Save from toolbar
    </button>
  )
}
```

- When `onSubmit` returns a promise, `formState.isSubmitting` stays `true` until the promise settles. The save button above is disabled for that time.
- A message set with `setError` shows in the field's error element. react-hook-form removes it when the field passes validation again.
- If the promise rejects, the rejection escapes the form's submit handler as an unhandled rejection, as in react-hook-form. Handle errors inside `onSubmit`, for example with `setError('root', { message })`.
- `useSmartFormSubmit()` returns the form's submit handler. Call it with no arguments, `onClick={() => submit()}`. A click event handed in becomes `onSubmit`'s `event`.
- A submit never bubbles to an enclosing form. A dialog rendered through a portal is still a React child of the page that opened it. Without this, submitting the dialog's form would also submit the page's form. With it, a dialog form inside a page form is safe.

## Loading and resetting

`<Form>` takes every `useForm` option as a prop. Two of them load data:

| You want to | Use |
|---|---|
| Show these values and follow them when they change | `values` |
| Start from these, then leave the user alone | `defaultValues` |

- `values` is compared deeply. A re-created but equal object does not reset what the user typed. A changed object resets the form to it.
- `defaultValues` alone does not follow changes. Call `reset(next)`, or remount the form with a `key`.
- `reset` comes from `useSmartForm()`, from the `methods` argument of `onSubmit`, or from react-hook-form's `useFormContext()` inside the form. `reset({})` means "reset to the defaults" in react-hook-form, not "empty every field".
- After a `reset()` to data that lacks a mounted field, react-hook-form keeps the value that field mounted with. The old value stays on screen and is submitted.
- After a `values` change to data that lacks a mounted field, the old value also stays on screen, but it is not submitted. The submission follows the new data, so it no longer matches the screen. For both cases, two remedies: give every field a value in the data, even an empty one such as `''` or `null`, rather than leaving its key out; or key the form by record so it remounts: `<Form key={client.id} values={client} onSubmit={save}>`.

`<Form>` turns `shouldUnregister` on. A value is in the submission only while a field for it is mounted. Hiding a section removes its values. A key in `values` or `defaultValues` that no field shows is not submitted either; keep such a value, an id for example, with `<Hidden>`. Pass `shouldUnregister={false}` to turn this off. The submission is then the loaded data with the user's changes, including keys that no field shows.

`mode` defaults to `'onChange'`, so errors appear as the user types. Every other option keeps react-hook-form's default. Passing `undefined` for an option keeps the default.

## Hidden fields

`<Hidden name>` keeps a value in the submission without showing a field:

```tsx
import { Hidden } from 'react-hook-smartform'

interface SavedClient extends Client {
  id: number
}

function EditClientForm({ client, save }: { client: SavedClient; save: SmartFormSubmitHandler<SavedClient> }) {
  return (
    <Form<SavedClient> values={client} onSubmit={save}>
      <Hidden name="id" />
      <TextField name="name" label="Name" />
      <TextField name="phone" label="Phone" />
      <button type="submit">Save</button>
    </Form>
  )
}
```

- `Hidden` renders `<input type="hidden">` with the full path as its `name`. The form value keeps its type: a number stays a number.
- With `unmountIfEmpty`, `Hidden` renders and registers nothing while the field has no value, so the key stays out of the submission. A new record without an id is the usual case.
- `unmountIfEmpty` decides at render time. It looks at the current value, then at the form's defaults.
- Only `undefined`, `null` and `''` count as empty. `0` and `false` are values.

## Lower level: useSmartForm

`useSmartForm(options)` is react-hook-form's `useForm` plus a `Form` element. That element provides react-hook-form's context, the root scope and the submit handler to everything inside it. `<Form>` is built on it.

```tsx
import { useSmartForm } from 'react-hook-smartform'

interface Note {
  text: string
}

function NoteForm({ addNote }: { addNote: (note: Note) => void }) {
  const { Form, handleSubmit, reset } = useSmartForm<Note>({ defaultValues: { text: '' } })
  return (
    <Form
      onSubmit={handleSubmit((note) => {
        addNote(note)
        reset()
      })}
    >
      <TextField name="text" label="Note" />
      <button type="submit">Add note</button>
    </Form>
  )
}
```

Use `useSmartForm` when the component that renders the form needs the form's methods, as `NoteForm` needs `reset`. It passes your options to `useForm` unchanged: `mode` is `'onSubmit'` and `shouldUnregister` is `false` unless you set them. Its `Form` takes `onSubmit: (event?) => …`, usually `handleSubmit(onValid)`. The returned object and its `Form` keep their identity across renders, and `formState` stays current.

## API

### Form

```ts
type SmartFormSubmitHandler<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> = (values: TTransformedValues, event: BaseSyntheticEvent | undefined, methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>) => unknown;
interface FormProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> extends Omit<SmartFormElementProps, 'onSubmit'>, UseFormProps<TFieldValues, TContext, TTransformedValues> {
  /** Called with valid values. Return a promise to keep `formState.isSubmitting` on until it settles. */
  onSubmit: SmartFormSubmitHandler<TFieldValues, TContext, TTransformedValues>;
}
/**
 * A form in one element: react-hook-form's options and the form element's attributes side by side.
 *
 * Validates on change and leaves unmounted fields out of the submission unless told otherwise.
 */
export declare function Form<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>({ onSubmit, children, ...rest }: FormProps<TFieldValues, TContext, TTransformedValues>): import("react").JSX.Element;
```

| Prop | Type | Default | |
|---|---|---|---|
| `onSubmit` | `SmartFormSubmitHandler<TFieldValues>` | required | Called with `(values, event, methods)` after validation passes. |
| `values` | `TFieldValues` | | Shown and followed when it changes (deep-compared). |
| `defaultValues` | `DefaultValues<TFieldValues>` | | Read once; later changes are ignored. |
| `mode` | react-hook-form `Mode` | `'onChange'` | When validation runs. |
| `shouldUnregister` | `boolean` | `true` | Leave unmounted fields out of the submission. |
| other `useForm` options | | react-hook-form's | `resolver`, `criteriaMode`, `disabled` and the rest. |
| `<form>` attributes | | | `className`, `aria-label`, `noValidate` and the rest go to the `<form>` element. |
| `children` | `ReactNode` | | |

Renders a `<form>` that provides the form, the root scope and the submit handler. An option passed as `undefined` keeps its default. Type exports: `FormProps`, `SmartFormSubmitHandler`.

### useSmartForm

```ts
interface SmartFormElementProps extends Omit<ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  /** Usually `handleSubmit(onValid)`. Descendants get it back from `useSmartFormSubmit()`. */
  onSubmit: SmartFormSubmit;
  children?: ReactNode;
}
/** The `<form>` element `useSmartForm` returns. */
type SmartFormElement = (props: SmartFormElementProps) => ReactNode;
type UseSmartFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> = UseFormProps<TFieldValues, TContext, TTransformedValues>;
interface UseSmartFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> extends UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  /**
   * A `<form>` that provides react-hook-form's context, the root scope and the submit handler
   * to everything inside it. The same component on every render, so children keep their state.
   */
  Form: SmartFormElement;
}
/** `useForm` plus a `Form` element that wires the context up. */
export declare function useSmartForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>(props?: UseSmartFormProps<TFieldValues, TContext, TTransformedValues>): UseSmartFormReturn<TFieldValues, TContext, TTransformedValues>;
```

| Returns | |
|---|---|
| everything `useForm` returns | `control`, `handleSubmit`, `reset`, `setError`, `formState` and the rest. |
| `Form` | A `<form>` component. Props: the `<form>` attributes plus `onSubmit: SmartFormSubmit`. |

Calls `useForm(options)` unchanged and returns the same object on every render, with a live `formState`. Type exports: `UseSmartFormProps`, `UseSmartFormReturn`, `SmartFormElement`, `SmartFormElementProps`.

### useSmartFormSubmit

```ts
type SmartFormSubmit = (event?: BaseSyntheticEvent) => Promise<void> | void;
export declare const SubmitContext: import("react").Context<SmartFormSubmit | null>;
/** The enclosing form's submit handler, for buttons that are not `type="submit"`. */
export declare function useSmartFormSubmit(): SmartFormSubmit;
```

| Returns | |
|---|---|
| `SmartFormSubmit` | The enclosing form's submit handler. Keeps one identity while `onSubmit` is stable. |

Call the handler with no arguments. Throws outside `<Form>` or a `useSmartForm` `Form`. Type export: `SmartFormSubmit`.

### FormScope

```ts
type FieldName = string | number;
type FormScopeType = 'object' | 'array';
```

```ts
interface FormScopeProps {
  name: FieldName;
  /** `'array'` when the children address rows by index. `<FieldArray>` sets this for you. */
  type?: FormScopeType;
  children?: ReactNode;
}
/** Prefixes the names of every field inside it. Scopes nest. */
export declare function FormScope({ name, type, children }: FormScopeProps): import("react").JSX.Element;
```

| Prop | Type | Default | |
|---|---|---|---|
| `name` | `FieldName` | required | Relative to the enclosing scope. |
| `type` | `'object' \| 'array'` | `'object'` | `'array'` when the children address rows by index. |
| `children` | `ReactNode` | | |

Prefixes the names of every field inside it. Type exports: `FormScopeProps`, `FieldName`, `FormScopeType`.

### useFormScope

```ts
interface FormScopeContextValue {
  /** Full dotted path of this scope. `undefined` at the form root. */
  readonly path: string | undefined;
  readonly type: FormScopeType;
  /** Resolves a name relative to this scope to the full path react-hook-form registers. */
  readonly getPath: (name: FieldName) => string;
}
```

```ts
export declare function useFormScope(): FormScopeContextValue;
```

| Returns | |
|---|---|
| `path` | Full dotted path of the scope, `undefined` at the form root. |
| `type` | `'object'` or `'array'`. |
| `getPath(name)` | The full path for a name relative to this scope. |

Returns the enclosing scope. Throws outside a form. Type export: `FormScopeContextValue`.

### useScopedController

```ts
interface UseScopedControllerProps<TValue> {
  /** Relative to the enclosing scope. */
  name: FieldName;
  /** Used when the form's defaultValues hold nothing for this field. */
  defaultValue?: TValue;
  /**
   * What `field.value` reports while the form holds no value and no default applies: a display
   * fallback that keeps the input controlled; the field is still registered and submits
   * `undefined`. Only a field without `defaultValue` (and without a form default) ever shows it,
   * because react-hook-form falls back to a default whenever one exists. Defaults to `defaultValue`.
   */
  emptyValue?: TValue;
  rules?: UseControllerProps<FieldValues, string>['rules'];
  disabled?: boolean;
  shouldUnregister?: boolean;
}
interface ScopedField<TValue> extends Omit<ControllerRenderProps<FieldValues, string>, 'value'> {
  value: TValue;
}
interface UseScopedControllerReturn<TValue> {
  field: ScopedField<TValue>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<FieldValues>;
}
/**
 * `useController` for a field named relative to the enclosing scope.
 *
 * `field.value` is typed by `defaultValue`/`emptyValue`; give one of them and the value is never
 * `undefined`. The form's defaultValues still win over `defaultValue`, as in react-hook-form.
 */
export declare function useScopedController<TValue>(props: UseScopedControllerProps<TValue> & ({
  defaultValue: TValue;
} | {
  emptyValue: TValue;
})): UseScopedControllerReturn<TValue>;
export declare function useScopedController<TValue = unknown>(props: UseScopedControllerProps<TValue>): UseScopedControllerReturn<TValue | undefined>;
```

| Prop | Type | |
|---|---|---|
| `name` | `FieldName` | Relative to the enclosing scope. Required. |
| `defaultValue` | `TValue` | Used when the form holds no default for the field. |
| `emptyValue` | `TValue` | What `field.value` reports while the field has no value and no default. Display only: the field still submits `undefined`. Defaults to `defaultValue`. |
| `rules` | react-hook-form rules | Validation, as `useController` takes it. |
| `disabled` | `boolean` | As in `useController`. |
| `shouldUnregister` | `boolean` | Overrides the form's setting for this field. |

| Returns | |
|---|---|
| `field` | `useController`'s `field`, with `name` set to the full path and `value` typed `TValue`. |
| `fieldState` | `invalid`, `error`, `isDirty`, `isTouched` and the rest. |
| `formState` | The form's state. |

`useController` for a field named relative to the enclosing scope. Type exports: `UseScopedControllerProps`, `UseScopedControllerReturn`, `ScopedField`.

### FieldArray

```ts
interface FieldArrayProps {
  name: FieldName;
  rules?: UseFieldArrayProps<FieldValues, string, FieldArrayKey>['rules'];
  shouldUnregister?: boolean;
  children?: ReactNode;
}
/**
 * An array scope: inside it, numeric names address rows. Rows of objects wrap their fields in
 * `<FormScope name={index}>`; rows of plain values use `name={index}` directly.
 */
export declare function FieldArray({ name, rules, shouldUnregister, children }: FieldArrayProps): import("react").JSX.Element;
```

| Prop | Type | |
|---|---|---|
| `name` | `FieldName` | Relative to the enclosing scope. Required. Do not change it while mounted. |
| `rules` | `useFieldArray` rules | `required`, `minLength`, `maxLength`, `validate`. |
| `shouldUnregister` | `boolean` | As in `useFieldArray`. |
| `children` | `ReactNode` | |

Runs `useFieldArray` and opens an array scope. Type export: `FieldArrayProps`.

### useFieldArrayScope

```ts
type FieldArrayRow<TRow> = {
  readonly [FIELD_ARRAY_KEY]: string;
} & (TRow extends object ? TRow : unknown);
interface FieldArrayContextValue<TRow = unknown> {
  /** Full path of the array. */
  readonly path: string;
  readonly keyName: FieldArrayKey;
  /** A snapshot per row, for keys and counts. Read live values through field components or `useWatch`, not from here. */
  readonly fields: ReadonlyArray<FieldArrayRow<TRow>>;
  append(value: TRow | TRow[], options?: FieldArrayMethodProps): void;
  prepend(value: TRow | TRow[], options?: FieldArrayMethodProps): void;
  insert(index: number, value: TRow | TRow[], options?: FieldArrayMethodProps): void;
  remove(index?: number | number[]): void;
  swap(indexA: number, indexB: number): void;
  move(from: number, to: number): void;
  update(index: number, value: TRow): void;
  replace(value: TRow[]): void;
  /** One node per row, keyed for React. `lastIndex` is `fields.length - 1`. */
  renderFields(render: (index: number, lastIndex: number) => ReactNode): ReactNode[];
}
export declare const FieldArrayContext: import("react").Context<FieldArrayContextValue<unknown> | null>;
/** The enclosing `<FieldArray>`: its rows, the methods to change them, and `renderFields`. */
export declare function useFieldArrayScope<TRow = unknown>(): FieldArrayContextValue<TRow>;
```

| Returns | |
|---|---|
| `path` | Full path of the array. |
| `keyName` | `'smartformKey'`. |
| `fields` | One snapshot per row, with a `smartformKey` string. For keys and counts, not live values. |
| `append`, `prepend`, `insert`, `remove`, `swap`, `move`, `update`, `replace` | react-hook-form's field array methods. |
| `renderFields(render)` | One keyed node per row; `render` gets `(index, lastIndex)`. |

Returns the enclosing `<FieldArray>`. Throws outside one. Type exports: `FieldArrayContextValue`, `FieldArrayRow`.

### withFieldArray

```ts
/** Wraps a component that renders rows so `<Rows name="addresses" />` is its own `<FieldArray>`. */
export declare function withFieldArray<P extends {
  name: FieldName;
}>(Component: ComponentType<P>, options?: Omit<FieldArrayProps, 'name' | 'children'>): {
  (props: P): import("react").JSX.Element;
  displayName: string;
};
```

| Parameter | |
|---|---|
| `Component` | A component that renders rows. Its props must include `name`. |
| `options` | `rules` and `shouldUnregister` for the `<FieldArray>`. |

Returns a component that renders `Component` inside `<FieldArray name={props.name}>` and passes it all its props.

### Hidden

```ts
interface HiddenProps {
  name: FieldName;
  /** Render (and register) nothing while the form has no value for the field. */
  unmountIfEmpty?: boolean;
  rules?: UseScopedControllerProps<unknown>['rules'];
  shouldUnregister?: boolean;
}
/** Keeps a value (an id, say) in the submission without rendering a visible field. */
export declare function Hidden({ unmountIfEmpty, ...props }: HiddenProps): import("react").JSX.Element | null;
```

| Prop | Type | Default | |
|---|---|---|---|
| `name` | `FieldName` | required | Relative to the enclosing scope. |
| `unmountIfEmpty` | `boolean` | `false` | Render and register nothing while the value is `undefined`, `null` or `''`. |
| `rules` | react-hook-form rules | | As in `useScopedController`. |
| `shouldUnregister` | `boolean` | | Overrides the form's setting for this field. |

Renders `<input type="hidden">` with the full path as `name` and keeps the value, with its type, in the submission. Type export: `HiddenProps`.

### Contexts and getScopedPath

```ts
export declare function getScopedPath(parentPath: string | undefined, type: FormScopeType, name: FieldName): string;
export declare const FormScopeContext: import("react").Context<FormScopeContextValue | null>;
```

```ts
export declare const FieldArrayContext: import("react").Context<FieldArrayContextValue<unknown> | null>;
```

```ts
export declare const SubmitContext: import("react").Context<SmartFormSubmit | null>;
```

The three contexts behind the hooks. `FormScopeContext` holds the enclosing scope, `FieldArrayContext` the enclosing field array, `SubmitContext` the form's submit handler. Each is `null` outside its provider. Use them to provide a scope or a submit handler yourself, for example in a test. `getScopedPath(parentPath, type, name)` joins a relative name onto a scope path, and throws for a numeric name in an object scope.

### FIELD_ARRAY_KEY

```ts
export declare const FIELD_ARRAY_KEY = "smartformKey";
type FieldArrayKey = typeof FIELD_ARRAY_KEY;
```

The property that keys each entry of `fields`. It is never part of the values. Type export: `FieldArrayKey`.

## TypeScript

Values are typed end to end. `<Form<Client>>` types `values`, `defaultValues` and the `values` argument of `onSubmit`. `useScopedController` types `field.value` from `defaultValue` or `emptyValue`. `useFieldArrayScope<TRow>()` types `fields` and the row methods.

Field names are not checked against the value type. They are strings relative to a scope, and a reusable group like `AddressFields` cannot know the type of the form it sits in. What you lose: a misspelled name is a runtime hole, not a compile error. The field registers under the wrong key and the submission carries it there. Keep field components close to the data they edit, and validate submissions on the server. In Timle the OpenAPI schema is the source of truth for names.

## Migrating from 7.x

| 7.x | 8 |
|---|---|
| `<Form defaultValue={x}>` (auto-reset on change) | `<Form values={x}>` |
| `<Form defaultValue={x} hookParams={{ autoReset: false }}>` | `<Form defaultValues={x}>` |
| `hookParams={{ ... }}` | the same keys directly on `<Form>` |
| `onSubmit(values, event, methods)` | unchanged |
| `useFormContext().submit` | `useSmartFormSubmit()` |
| `useFormScope(name).name` | `useFormScope().getPath(name)` |
| `useFormScope(name).defaultValue` | gone — react-hook-form reads defaults by path; use `useWatch` or `formState.defaultValues` |
| `useScopedController({ defaultValue: '', emptyValue: '' })` | `emptyValue` defaults to `defaultValue`; both default to `undefined` (7.x: `''`) |
| `useScopedController` registered every field with `defaultValue: ''` | no default unless you give one; a field with neither `defaultValue` nor a form default is registered and submitted with the value `undefined` |
| `<Hidden unmountIfEmpty>` unmounted on any falsy value | unmounts only for `undefined`, `null` and `''`; `0` and `false` stay |
| `Hidden` always set `shouldUnregister` on its controller | follows the form's setting: `<Form>` turns it on, `useSmartForm` does not |
| `FieldArray` row key `Symbol()` | `smartformKey` (`FIELD_ARRAY_KEY`) |
| `FormScopeContext` value `{ defaultValue, type, getPath, path }` | `{ path, type, getPath }` |
| CommonJS build | ESM only |
| React 17/18 | React 19 |

`useScopedController`'s `emptyValue` now applies only to a field with no default. 7.x applied it whenever the controller returned `undefined`.

New behaviour:

- A submit stops propagating, so it never reaches an enclosing form.
- `useFormScope`, `useFieldArrayScope` and `useSmartFormSubmit` throw when used outside their provider, with a message that names the missing component.
- `values` is compared deeply, so an equal object does not reset the form.

## Compatibility

- React ^19.
- react-hook-form ^7.77.0. Every test run covers 7.77.0 and the latest 7.x, as two vitest projects. Earlier versions drop unchanged fields from the submission of a form loaded with `values` while `shouldUnregister` is on.
- No dependency on `react-dom`.
- ES modules only. Type declarations included.

## Development

Run these in the package directory:

| Script | |
|---|---|
| `pnpm build` | Builds `dist/` with tsdown. |
| `pnpm typecheck` | Type-checks the sources, then the tests. |
| `pnpm lint` | Runs oxlint. |
| `pnpm test` | Runs vitest once. |
| `pnpm check:package` | Checks the built package with publint and arethetypeswrong. |
| `pnpm check` | All of the above. |

`pnpm test` runs every test twice, in two vitest projects: `react-hook-form@latest` against the installed react-hook-form, and `react-hook-form@7.77` against 7.77.0 through an alias.

The examples in this README are tested. Every code block, apart from the two marked illustrative and the signatures under API, is a verbatim copy of code in `src/readme.test.tsx`, where each section has a `describe` block that renders the example and checks what a user sees. Change an example there first, then copy it here.

## License

MIT
