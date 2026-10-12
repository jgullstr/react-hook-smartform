import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { FieldArray } from './FieldArray'
import { useFieldArrayScope } from './FieldArrayContext'
import { withFieldArray } from './withFieldArray'
import { Form } from '../form/Form'
import { FormScope } from '../scope/FormScope'
import { Input, SubmitButton } from '../test/fields'

interface Address {
  street: string
}

function AddressRows() {
  const { renderFields, append, remove, move } = useFieldArrayScope<Address>()
  return (
    <ul>
      {renderFields((index, lastIndex) => (
        <li aria-label={`Row ${index + 1}`}>
          <FormScope name={index}>
            <Input name="street" label="Street" />
          </FormScope>
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
          <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)}>
            Up
          </button>
          <button type="button" disabled={index === lastIndex} onClick={() => move(index, index + 1)}>
            Down
          </button>
        </li>
      ))}
      <button type="button" onClick={() => append({ street: '' })}>
        Add address
      </button>
    </ul>
  )
}

const row = (n: number) => within(screen.getByRole('listitem', { name: `Row ${n}` }))

describe('FieldArray', () => {
  it('renders a row per item in the default values and submits them', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <Form defaultValues={{ addresses: [{ street: 'Main St' }, { street: 'High St' }] }} onSubmit={onSubmit}>
        <FieldArray name="addresses">
          <AddressRows />
        </FieldArray>
        <SubmitButton />
      </Form>,
    )

    expect(row(1).getByLabelText('Street')).toHaveValue('Main St')
    expect(row(2).getByLabelText('Street')).toHaveValue('High St')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ addresses: [{ street: 'Main St' }, { street: 'High St' }] })
  })

  it('appends, removes and moves rows while keeping what was typed', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <Form defaultValues={{ addresses: [{ street: 'Main St' }] }} onSubmit={onSubmit}>
        <FieldArray name="addresses">
          <AddressRows />
        </FieldArray>
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add address' }))
    await userEvent.type(row(2).getByLabelText('Street'), 'High St')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    await userEvent.click(row(2).getByRole('button', { name: 'Up' }))
    expect(row(1).getByLabelText('Street')).toHaveValue('High St')
    expect(row(2).getByLabelText('Street')).toHaveValue('Main St')
    expect(row(1).getByRole('button', { name: 'Up' })).toBeDisabled()
    expect(row(2).getByRole('button', { name: 'Down' })).toBeDisabled()

    await userEvent.click(row(2).getByRole('button', { name: 'Remove' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(row(1).getByLabelText('Street')).toHaveValue('High St')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ addresses: [{ street: 'High St' }] })
  })

  it('renders and submits rows of plain strings', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    function TagRows() {
      const { renderFields, append } = useFieldArrayScope<string>()
      return (
        <>
          {renderFields((index) => (
            <Input name={index} label={`Tag ${index + 1}`} />
          ))}
          <button type="button" onClick={() => append('')}>
            Add tag
          </button>
        </>
      )
    }
    render(
      <Form defaultValues={{ tags: ['red', 'green'] }} onSubmit={onSubmit}>
        <FieldArray name="tags">
          <TagRows />
        </FieldArray>
        <SubmitButton />
      </Form>,
    )

    expect(screen.getByLabelText('Tag 1')).toHaveValue('red')
    expect(screen.getByLabelText('Tag 2')).toHaveValue('green')
    await userEvent.click(screen.getByRole('button', { name: 'Add tag' }))
    await userEvent.type(screen.getByLabelText('Tag 3'), 'blue')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ tags: ['red', 'green', 'blue'] })
  })

  it('nests arrays inside rows', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    function PhoneRows() {
      const { renderFields, append } = useFieldArrayScope<string>()
      return (
        <>
          {renderFields((index) => (
            <Input name={index} label={`Phone ${index + 1}`} />
          ))}
          <button type="button" onClick={() => append('')}>
            Add phone
          </button>
        </>
      )
    }
    function PersonRows() {
      const { renderFields } = useFieldArrayScope<{ name: string; phones: string[] }>()
      return renderFields((index) => (
        <FormScope name={index}>
          <Input name="name" label={`Name ${index + 1}`} />
          <FieldArray name="phones">
            <PhoneRows />
          </FieldArray>
        </FormScope>
      ))
    }
    render(
      <Form defaultValues={{ people: [{ name: 'Ada', phones: ['1'] }] }} onSubmit={onSubmit}>
        <FieldArray name="people">
          <PersonRows />
        </FieldArray>
        <SubmitButton />
      </Form>,
    )

    expect(screen.getByLabelText('Phone 1')).toHaveValue('1')
    await userEvent.click(screen.getByRole('button', { name: 'Add phone' }))
    await userEvent.type(screen.getByLabelText('Phone 2'), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ people: [{ name: 'Ada', phones: ['1', '2'] }] })
  })

  it('shows new rows when the form values change', async () => {
    function Host() {
      const [addresses, setAddresses] = useState([{ street: 'Main St' }])
      return (
        <>
          <Form values={{ addresses }} onSubmit={() => {}}>
            <FieldArray name="addresses">
              <AddressRows />
            </FieldArray>
          </Form>
          <button type="button" onClick={() => setAddresses([{ street: 'A' }, { street: 'B' }])}>
            Load
          </button>
        </>
      )
    }
    render(<Host />)

    await userEvent.click(screen.getByRole('button', { name: 'Load' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(row(2).getByLabelText('Street')).toHaveValue('B')
  })

  it('exposes the array path and row keys', () => {
    function Probe() {
      const { path, fields, keyName } = useFieldArrayScope<Address>()
      return (
        <output>
          {path} {keyName} {fields.map((f) => typeof f.smartformKey).join(',')} {fields[0]?.street}
        </output>
      )
    }
    render(
      <Form defaultValues={{ client: { addresses: [{ street: 'Main St' }] } }} onSubmit={() => {}}>
        <FormScope name="client">
          <FieldArray name="addresses">
            <Probe />
          </FieldArray>
        </FormScope>
      </Form>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('client.addresses smartformKey string Main St')
  })

  it('wraps a component in an array scope with withFieldArray', async () => {
    const Addresses = withFieldArray(AddressRows)
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <Form defaultValues={{ addresses: [{ street: 'Main St' }] }} onSubmit={onSubmit}>
        <Addresses name="addresses" />
        <SubmitButton />
      </Form>,
    )

    expect(row(1).getByLabelText('Street')).toHaveValue('Main St')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ addresses: [{ street: 'Main St' }] })
  })

  it('tells the author when useFieldArrayScope is used outside FieldArray', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Lost() {
      useFieldArrayScope()
      return null
    }
    expect(() =>
      render(
        <Form onSubmit={() => {}}>
          <Lost />
        </Form>,
      ),
    ).toThrow(/inside <FieldArray>/)
  })
})
