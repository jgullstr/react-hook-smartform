import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hidden } from './Hidden'
import { FieldArray } from '../array/FieldArray'
import { useFieldArrayScope } from '../array/FieldArrayContext'
import { Form } from '../form/Form'
import { FormScope } from '../scope/FormScope'
import { Input, SubmitButton } from '../test/fields'

describe('Hidden', () => {
  it('carries a value into the submission without showing it', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    const { container } = render(
      <Form defaultValues={{ id: 5, name: 'Ada' }} onSubmit={onSubmit}>
        <Hidden name="id" />
        <Input name="name" label="Name" />
        <SubmitButton />
      </Form>,
    )

    expect(container.querySelector('input[type="hidden"][name="id"]')).toHaveValue('5')
    expect(screen.queryByRole('textbox', { name: 'id' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ id: 5, name: 'Ada' })
  })

  it('renders nothing and submits nothing for a missing value when unmountIfEmpty is set', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    const { container } = render(
      <Form defaultValues={{ name: 'Ada', note: '' }} onSubmit={onSubmit}>
        <Hidden name="id" unmountIfEmpty />
        <Hidden name="note" unmountIfEmpty />
        <Input name="name" label="Name" />
        <SubmitButton />
      </Form>,
    )

    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ada' })
  })

  it('treats 0 and false as present', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    render(
      <Form defaultValues={{ count: 0, flag: false }} onSubmit={onSubmit}>
        <Hidden name="count" unmountIfEmpty />
        <Hidden name="flag" unmountIfEmpty />
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ count: 0, flag: false })
  })

  it('works inside array rows, both loaded and appended', async () => {
    const onSubmit = vi.fn<(values: unknown) => void>()
    function Rows() {
      const { renderFields, append } = useFieldArrayScope<{ venue_id?: number; note: string }>()
      return (
        <>
          {renderFields((index) => (
            <FormScope name={index}>
              <Hidden name="venue_id" unmountIfEmpty />
              <Input name="note" label={`Note ${index + 1}`} />
            </FormScope>
          ))}
          <button type="button" onClick={() => append({ venue_id: 9, note: '' })}>
            Add with venue
          </button>
          <button type="button" onClick={() => append({ note: '' })}>
            Add without venue
          </button>
        </>
      )
    }
    render(
      <Form defaultValues={{ locks: [{ venue_id: 3, note: 'a' }] }} onSubmit={onSubmit}>
        <FieldArray name="locks">
          <Rows />
        </FieldArray>
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add with venue' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add without venue' }))
    await userEvent.type(screen.getByLabelText('Note 3'), 'c')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit.mock.calls[0]![0]).toEqual({
      locks: [
        { venue_id: 3, note: 'a' },
        { venue_id: 9, note: '' },
        { note: 'c' },
      ],
    })
  })
})
