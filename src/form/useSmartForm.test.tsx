import { useEffect, useState } from 'react'
import { useController } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSmartForm } from './useSmartForm'
import { useSmartFormSubmit } from './SubmitContext'
import { useFormScope } from '../scope/FormScopeContext'

function Field({ name }: { name: string }) {
  const path = useFormScope().getPath(name)
  const { field } = useController({ name: path, defaultValue: '' })
  return <input aria-label={path} {...field} />
}

describe('useSmartForm', () => {
  it('renders a form element with the given attributes and submits through handleSubmit', async () => {
    const onSubmit = vi.fn<(values: { name: string }, event?: React.BaseSyntheticEvent) => void>()
    function Host() {
      const { Form, handleSubmit } = useSmartForm<{ name: string }>({ defaultValues: { name: 'Ada' } })
      return (
        <Form onSubmit={handleSubmit(onSubmit)} aria-label="Client" className="stack">
          <Field name="name" />
          <button type="submit">Save</button>
        </Form>
      )
    }
    render(<Host />)

    const form = screen.getByRole('form', { name: 'Client' })
    expect(form).toHaveClass('stack')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' }, expect.anything())
  })

  it('keeps the same Form component across renders so children are not remounted', async () => {
    const mounted = vi.fn<() => void>()
    function Probe() {
      useEffect(() => {
        mounted()
      }, [])
      return null
    }
    function Host() {
      const [count, setCount] = useState(0)
      const { Form, handleSubmit } = useSmartForm()
      return (
        <Form onSubmit={handleSubmit(() => {})}>
          <Probe />
          <Field name="name" />
          <button type="button" onClick={() => setCount(count + 1)}>
            Rendered {count}
          </button>
        </Form>
      )
    }
    render(<Host />)

    await userEvent.type(screen.getByLabelText('name'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: /Rendered/ }))
    await userEvent.click(screen.getByRole('button', { name: /Rendered/ }))

    expect(screen.getByRole('button', { name: 'Rendered 2' })).toBeInTheDocument()
    expect(mounted).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('name')).toHaveValue('Ada')
  })

  it('reports live form state through the object it returns', async () => {
    function Host() {
      const form = useSmartForm()
      return (
        <form.Form onSubmit={form.handleSubmit(() => {})}>
          <Field name="name" />
          <output>{form.formState.isDirty ? 'dirty' : 'clean'}</output>
        </form.Form>
      )
    }
    render(<Host />)

    expect(screen.getByRole('status')).toHaveTextContent('clean')
    await userEvent.type(screen.getByLabelText('name'), 'A')
    expect(screen.getByRole('status')).toHaveTextContent('dirty')
  })

  it('returns the same object on every render', () => {
    const seen: unknown[] = []
    function Host() {
      const [, rerender] = useState(0)
      const form = useSmartForm()
      seen.push(form)
      return (
        <form.Form onSubmit={form.handleSubmit(() => {})}>
          <button type="button" onClick={() => rerender((n) => n + 1)}>
            Again
          </button>
        </form.Form>
      )
    }
    render(<Host />)
    return userEvent.click(screen.getByRole('button', { name: 'Again' })).then(() => {
      expect(seen.length).toBeGreaterThan(1)
      expect(new Set(seen).size).toBe(1)
    })
  })

  it('gives descendants the submit handler through useSmartFormSubmit', async () => {
    const onSubmit = vi.fn<(values: { name: string }, event?: React.BaseSyntheticEvent) => void>()
    function SubmitFromAnywhere() {
      const submit = useSmartFormSubmit()
      return (
        <button type="button" onClick={() => submit()}>
          Save
        </button>
      )
    }
    function Host() {
      const { Form, handleSubmit } = useSmartForm<{ name: string }>({ defaultValues: { name: 'Ada' } })
      return (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Field name="name" />
          <SubmitFromAnywhere />
        </Form>
      )
    }
    render(<Host />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' }, undefined)
  })

  it('lets a click that triggers a submit keep bubbling', async () => {
    const outerClick = vi.fn<() => void>()
    const onSubmit = vi.fn<(values: unknown) => void>()
    function SaveButton() {
      const submit = useSmartFormSubmit()
      return (
        <button type="button" onClick={submit}>
          Save
        </button>
      )
    }
    function Host() {
      const { Form, handleSubmit } = useSmartForm<{ name: string }>({ defaultValues: { name: 'Ada' } })
      return (
        <div onClick={outerClick}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Field name="name" />
            <SaveButton />
          </Form>
        </div>
      )
    }
    render(<Host />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' }, expect.objectContaining({ type: 'click' }))
    expect(outerClick).toHaveBeenCalledTimes(1)
  })

  it('does not let a submit bubble to a form the portal target sits in', async () => {
    const outer = vi.fn<(e: React.FormEvent) => void>((e) => e.preventDefault())
    const inner = vi.fn<(values: unknown) => void>()
    function Dialog() {
      const { Form, handleSubmit } = useSmartForm()
      return createPortal(
        <Form onSubmit={handleSubmit(inner)}>
          <button type="submit">Confirm</button>
        </Form>,
        document.body,
      )
    }
    render(
      <form onSubmit={outer}>
        <Dialog />
      </form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
  })

  it('tells the author when useSmartFormSubmit is used outside a form', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Lost() {
      useSmartFormSubmit()
      return null
    }
    expect(() => render(<Lost />)).toThrow(/inside <Form>/)
  })
})
