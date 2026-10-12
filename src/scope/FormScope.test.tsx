import { useController } from 'react-hook-form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormScope } from './FormScope'
import { getScopedPath, useFormScope, type FieldName } from './FormScopeContext'
import { useSmartForm } from '../form/useSmartForm'

// A field written the way the README recipe writes one, before useScopedController exists.
function Field({ name }: { name: FieldName }) {
  const path = useFormScope().getPath(name)
  const { field } = useController({ name: path, defaultValue: '' })
  return <input aria-label={path} {...field} />
}

function TestForm({ onSubmit, children }: { onSubmit: (values: unknown) => void; children: React.ReactNode }) {
  const { Form, handleSubmit } = useSmartForm({ shouldUnregister: true })
  return (
    <Form onSubmit={handleSubmit((values) => onSubmit(values))}>
      {children}
      <button type="submit">Save</button>
    </Form>
  )
}

describe('getScopedPath', () => {
  it('joins a name onto a scope path', () => {
    expect(getScopedPath(undefined, 'object', 'name')).toBe('name')
    expect(getScopedPath('client', 'object', 'name')).toBe('client.name')
    expect(getScopedPath('items', 'array', 0)).toBe('items.0')
    expect(getScopedPath('items', 'array', '1')).toBe('items.1')
  })

  it('refuses numeric names in an object scope so values do not silently become arrays', () => {
    expect(() => getScopedPath('client', 'object', 0)).toThrow(TypeError)
    expect(() => getScopedPath('client', 'object', '7')).toThrow(/numeric field name "7" in object scope "client"/)
    expect(() => getScopedPath(undefined, 'object', 0)).toThrow(/object scope "\(root\)"/)
  })
})

describe('FormScope', () => {
  it('registers fields at the path built from the enclosing scopes', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <TestForm onSubmit={onSubmit}>
        <FormScope name="client">
          <Field name="name" />
          <FormScope name="address">
            <Field name="street" />
          </FormScope>
        </FormScope>
      </TestForm>,
    )

    await userEvent.type(screen.getByLabelText('client.name'), 'Ada')
    await userEvent.type(screen.getByLabelText('client.address.street'), 'Main St')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({ client: { name: 'Ada', address: { street: 'Main St' } } })
  })

  it('resolves dotted names under a scope', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <TestForm onSubmit={onSubmit}>
        <FormScope name="client">
          <Field name="address.street" />
        </FormScope>
      </TestForm>,
    )

    await userEvent.type(screen.getByLabelText('client.address.street'), 'Main St')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({ client: { address: { street: 'Main St' } } })
  })

  it('lets an array scope address rows by index', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <TestForm onSubmit={onSubmit}>
        <FormScope name="coords" type="array">
          <Field name={0} />
          <Field name={1} />
        </FormScope>
      </TestForm>,
    )

    await userEvent.type(screen.getByLabelText('coords.0'), '1')
    await userEvent.type(screen.getByLabelText('coords.1'), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({ coords: ['1', '2'] })
  })

  it('refuses a numeric name inside an object scope at render time', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <TestForm onSubmit={() => {}}>
          <FormScope name="client">
            <Field name={0} />
          </FormScope>
        </TestForm>,
      ),
    ).toThrow(/numeric field name/)
  })

  it('tells the author when a scope is used outside a form', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<FormScope name="x">x</FormScope>)).toThrow(/inside <Form>/)
  })
})
