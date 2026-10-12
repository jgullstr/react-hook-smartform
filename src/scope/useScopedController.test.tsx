import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormScope } from './FormScope'
import { useScopedController } from './useScopedController'
import { useSmartForm, type UseSmartFormProps } from '../form/useSmartForm'
import { Checkbox, Input } from '../test/fields'

function TestForm({
  onSubmit = () => {},
  children,
  ...props
}: UseSmartFormProps & { onSubmit?: (values: unknown) => void; children: React.ReactNode }) {
  const { Form, handleSubmit, reset, setValue } = useSmartForm({ shouldUnregister: true, ...props })
  return (
    <Form onSubmit={handleSubmit((values) => onSubmit(values))}>
      {children}
      {/* reset({}) means "back to the defaults" in react-hook-form; loading another record that
          lacks a field looks like reset to an object without it. */}
      <button type="button" onClick={() => reset({ other: 1 })}>
        Load other
      </button>
      <button type="button" onClick={() => setValue('count', undefined)}>
        Unset count
      </button>
      <button type="submit">Save</button>
    </Form>
  )
}

describe('useScopedController', () => {
  it('registers the field under its scope and submits what was typed', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <TestForm onSubmit={onSubmit}>
        <FormScope name="client">
          <Input name="name" label="Name" />
        </FormScope>
      </TestForm>,
    )

    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ client: { name: 'Ada' } })
  })

  it('shows the form default when there is one and the field default otherwise', () => {
    render(
      <TestForm defaultValues={{ client: { name: 'Ada' } }}>
        <FormScope name="client">
          <Input name="name" label="Name" />
          <Input name="city" label="City" />
          <Checkbox name="vip" label="VIP" />
        </FormScope>
      </TestForm>,
    )

    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('City')).toHaveValue('')
    expect(screen.getByLabelText('VIP')).not.toBeChecked()
  })

  it('stays controlled after reset to missing value', async () => {
    // A field with no default anywhere: emptyValue is all that keeps the input controlled.
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Nickname() {
      const { field } = useScopedController({ name: 'nickname', emptyValue: '' })
      return (
        <label>
          Nickname
          <input {...field} />
        </label>
      )
    }
    render(
      <TestForm>
        <Nickname />
      </TestForm>,
    )

    expect(screen.getByLabelText('Nickname')).toHaveValue('')
    await userEvent.type(screen.getByLabelText('Nickname'), 'Countess')
    expect(screen.getByLabelText('Nickname')).toHaveValue('Countess')
    await userEvent.click(screen.getByRole('button', { name: 'Load other' }))

    expect(screen.getByLabelText('Nickname')).toHaveValue('')
    expect(warn).not.toHaveBeenCalled()
  })

  it('shows the value it mounted with after a reset to data without the field', async () => {
    // react-hook-form keeps the default a mounted field was registered with, so a reset to data
    // that lacks the field leaves the previous record's value in place, in the submission too.
    // Callers avoid the carry-over by giving every field a value or by keying the form by record.
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <TestForm onSubmit={onSubmit} defaultValues={{ name: 'Ada' }}>
        <Input name="name" label="Name" />
      </TestForm>,
    )

    await userEvent.type(screen.getByLabelText('Name'), ' Lovelace')
    await userEvent.click(screen.getByRole('button', { name: 'Load other' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' })
  })

  it('shows emptyValue for a field without a default, without submitting it', async () => {
    // react-hook-form falls back to a default whenever one exists, so emptyValue only ever shows
    // for a field that has none. It is a display fallback, not a value: nothing is submitted.
    const onSubmit = vi.fn<(values: unknown) => void>()
    function Count() {
      const { field } = useScopedController({ name: 'count', emptyValue: 0 })
      return (
        <>
          <output>{String(field.value)}</output>
          <button type="button" onClick={() => field.onChange(5)}>
            Set five
          </button>
        </>
      )
    }
    render(
      <TestForm onSubmit={onSubmit}>
        <Count />
      </TestForm>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('0')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({})

    await userEvent.click(screen.getByRole('button', { name: 'Set five' }))
    expect(screen.getByRole('status')).toHaveTextContent('5')
    await userEvent.click(screen.getByRole('button', { name: 'Unset count' }))
    expect(screen.getByRole('status')).toHaveTextContent('0')
  })

  it('reports validation errors from rules', async () => {
    render(
      <TestForm mode="onChange">
        <Input name="email" label="Email" rules={{ required: 'Email is required' }} />
      </TestForm>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email is required')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('drops the value of an unmounted field from the submission', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    function Toggle() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            Hide
          </button>
          {open ? <Input name="company" label="Company" /> : null}
        </>
      )
    }
    render(
      <TestForm onSubmit={onSubmit} defaultValues={{ name: 'Ada', company: 'ACME' }}>
        <Input name="name" label="Name" />
        <Toggle />
      </TestForm>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Hide' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' })
  })

  it('gives the field its full path as name', () => {
    function Probe() {
      const { field } = useScopedController({ name: 'street', defaultValue: '' })
      return <output>{field.name}</output>
    }
    render(
      <TestForm>
        <FormScope name="address">
          <Probe />
        </FormScope>
      </TestForm>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('address.street')
  })
})
