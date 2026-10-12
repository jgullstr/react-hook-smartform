// Every code block in README.md is a verbatim copy of code in this file, in README order. Each
// README section's first block starts with the imports it adds, so those imports sit mid-file.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useId } from 'react'
import {
  Form,
  useScopedController,
  type FieldName,
  type SmartFormSubmitHandler,
  type UseScopedControllerProps,
} from './index'

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

describe('Quick start', () => {
  it('submits what the user typed', async () => {
    const save = vi.fn<SmartFormSubmitHandler<Client>>()
    render(<ClientForm client={{ name: 'Ada', phone: '' }} save={save} />)

    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    await userEvent.type(screen.getByLabelText('Phone'), '040 123 4567')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(save).toHaveBeenCalledTimes(1)
    expect(save.mock.calls[0]![0]).toEqual({ name: 'Ada', phone: '040 123 4567' })
  })
})

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

describe('Writing a field', () => {
  it('labels the input, links the error to it and marks it invalid', async () => {
    render(<ClientForm client={{ name: 'Ada', phone: '' }} save={() => {}} />)

    await userEvent.clear(screen.getByLabelText('Name'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a name.')
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Enter a name.')
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Phone')).not.toHaveAttribute('aria-describedby')
  })

  it('submits true after the switch is toggled', async () => {
    const save = vi.fn<(values: unknown) => void>()
    render(
      <Form onSubmit={save}>
        <Switch name="newsletter" label="Newsletter" />
        <button type="submit">Save</button>
      </Form>,
    )

    expect(screen.getByRole('switch', { name: 'Newsletter' })).not.toBeChecked()
    await userEvent.click(screen.getByRole('switch', { name: 'Newsletter' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(save.mock.calls[0]![0]).toEqual({ newsletter: true })
  })
})

import { FormScope } from './index'

function ClientAddress() {
  return (
    <FormScope name="address">
      <TextField name="street" label="Street" />
    </FormScope>
  )
}

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

describe('Scopes', () => {
  it('nests a scoped field under the scope name', async () => {
    const save = vi.fn<(values: unknown) => void>()
    render(
      <Form onSubmit={save}>
        <ClientAddress />
        <button type="submit">Save</button>
      </Form>,
    )

    await userEvent.type(screen.getByLabelText('Street'), 'Main St 1')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(save.mock.calls[0]![0]).toEqual({ address: { street: 'Main St 1' } })
  })

  it('places the same fields under two scopes', async () => {
    const save = vi.fn<SmartFormSubmitHandler<Order>>()
    render(<OrderForm save={save} />)

    const billing = within(screen.getByRole('group', { name: 'Billing address' }))
    const shipping = within(screen.getByRole('group', { name: 'Shipping address' }))
    await userEvent.type(billing.getByLabelText('Street'), 'Main St 1')
    await userEvent.type(billing.getByLabelText('City'), 'Vaasa')
    await userEvent.type(shipping.getByLabelText('Street'), 'Dock 4')
    await userEvent.type(shipping.getByLabelText('City'), 'Turku')
    await userEvent.click(screen.getByRole('button', { name: 'Order' }))

    expect(save.mock.calls[0]![0]).toEqual({
      billing: { street: 'Main St 1', city: 'Vaasa' },
      shipping: { street: 'Dock 4', city: 'Turku' },
    })
  })
})

import { FieldArray, useFieldArrayScope, withFieldArray } from './index'

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

describe('Field arrays', () => {
  it('adds rows of objects and of plain values and submits what was typed', async () => {
    const save = vi.fn<SmartFormSubmitHandler<Contact>>()
    const contact: Contact = { addresses: [{ street: 'Main St 1', city: 'Vaasa' }], tags: ['vip'] }
    render(<ContactForm contact={contact} save={save} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add address' }))
    const second = within(screen.getByRole('listitem', { name: 'Address 2' }))
    await userEvent.type(second.getByLabelText('Street'), 'Dock 4')
    await userEvent.type(second.getByLabelText('City'), 'Turku')
    await userEvent.click(second.getByRole('button', { name: 'Up' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add tag' }))
    await userEvent.type(screen.getByLabelText('Tag 2'), 'invoice')

    const first = within(screen.getByRole('listitem', { name: 'Address 1' }))
    expect(first.getByLabelText('Street')).toHaveValue('Dock 4')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(save.mock.calls[0]![0]).toEqual({
      addresses: [
        { street: 'Dock 4', city: 'Turku' },
        { street: 'Main St 1', city: 'Vaasa' },
      ],
      tags: ['vip', 'invoice'],
    })
  })

  it('removes a row and leaves out an array that values loaded without rows', async () => {
    const save = vi.fn<SmartFormSubmitHandler<Contact>>()
    const contact: Contact = {
      addresses: [
        { street: 'Main St 1', city: 'Vaasa' },
        { street: 'Dock 4', city: 'Turku' },
      ],
      tags: [],
    }
    render(<ContactForm contact={contact} save={save} />)

    const first = within(screen.getByRole('listitem', { name: 'Address 1' }))
    await userEvent.click(first.getByRole('button', { name: 'Remove' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    // react-hook-form, not this package: with values and shouldUnregister, tags: [] has no
    // mounted field to keep it, so the key is missing. The README says so under Field arrays.
    expect(save.mock.calls[0]![0]).toEqual({ addresses: [{ street: 'Dock 4', city: 'Turku' }] })
  })
})

import { useFormState } from 'react-hook-form'
import { useSmartFormSubmit } from './index'

// How the server refuses a value.
interface ServerError {
  field: keyof Client
  code: 'taken' | 'invalid'
}

const messages: Record<ServerError['code'], string> = {
  taken: 'Already in use.',
  invalid: 'Check this value.',
}

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

describe('Submitting', () => {
  it('shows what the server refused next to the field', async () => {
    const saveClient = vi.fn<(client: Client) => Promise<ServerError[]>>()
    saveClient.mockResolvedValue([{ field: 'phone', code: 'invalid' }])
    render(<NewClientForm saveClient={saveClient} />)

    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.type(screen.getByLabelText('Phone'), '12')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Check this value.')
    expect(screen.getByLabelText('Phone')).toHaveAccessibleDescription('Check this value.')
    expect(saveClient).toHaveBeenCalledWith({ name: 'Ada', phone: '12' })
  })

  it('disables the save button until the save settles', async () => {
    let answer!: (errors: ServerError[]) => void
    const saveClient = vi.fn<(client: Client) => Promise<ServerError[]>>(
      () =>
        new Promise((resolve) => {
          answer = resolve
        }),
    )
    render(<NewClientForm saveClient={saveClient} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    answer([])
    expect(await screen.findByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('submits from a button that is not a submit button', async () => {
    const saveClient = vi.fn<(client: Client) => Promise<ServerError[]>>()
    saveClient.mockResolvedValue([])
    render(<NewClientForm saveClient={saveClient} />)

    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Save from toolbar' }))

    expect(saveClient).toHaveBeenCalledWith({ name: 'Ada', phone: '' })
  })
})

import { Hidden } from './index'

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

describe('Hidden fields', () => {
  it('keeps the id in the submission without showing it', async () => {
    const save = vi.fn<SmartFormSubmitHandler<SavedClient>>()
    render(<EditClientForm client={{ id: 7, name: 'Ada', phone: '' }} save={save} />)

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    await userEvent.type(screen.getByLabelText('Phone'), '040 123 4567')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(save.mock.calls[0]![0]).toEqual({ id: 7, name: 'Ada', phone: '040 123 4567' })
  })
})

import { useSmartForm } from './index'

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

describe('Lower level: useSmartForm', () => {
  it('submits through handleSubmit and clears the field with reset', async () => {
    const addNote = vi.fn<(note: Note) => void>()
    render(<NoteForm addNote={addNote} />)

    await userEvent.type(screen.getByLabelText('Note'), 'Call back on Monday')
    await userEvent.click(screen.getByRole('button', { name: 'Add note' }))

    expect(addNote).toHaveBeenCalledWith({ text: 'Call back on Monday' })
    expect(screen.getByLabelText('Note')).toHaveValue('')
  })
})
