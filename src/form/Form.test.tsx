import { useState } from 'react'
import { createPortal } from 'react-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, type SmartFormSubmitHandler } from './Form'
import { useSmartFormSubmit } from './SubmitContext'
import { Checkbox, Input, SubmitButton } from '../test/fields'

interface Client {
  name: string
  email: string
  is_company: boolean
  company?: string
}

describe('Form', () => {
  it('submits the values with the form methods', async () => {
    const onSubmit = vi.fn<SmartFormSubmitHandler<Client>>()
    render(
      <Form<Client> defaultValues={{ name: 'Ada', email: 'ada@example.com', is_company: false }} onSubmit={onSubmit}>
        <Input name="name" label="Name" />
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const [values, event, methods] = onSubmit.mock.calls[0]!
    expect(values).toEqual({ name: 'Ada' })
    expect(event).toBeDefined()
    expect(typeof methods.setError).toBe('function')
  })

  it('passes form attributes to the form element and useForm options to the form', async () => {
    const onSubmit = vi.fn<SmartFormSubmitHandler<Client>>()
    render(
      <Form<Client> onSubmit={onSubmit} aria-label="Client" className="stack" noValidate mode="onSubmit">
        <Input name="email" label="Email" rules={{ required: 'Required' }} />
        <SubmitButton />
      </Form>,
    )

    const form = screen.getByRole('form', { name: 'Client' })
    expect(form).toHaveClass('stack')
    expect(form).toHaveAttribute('novalidate')
    // mode="onSubmit": no error until the form is submitted, even after the field was touched.
    await userEvent.click(screen.getByLabelText('Email'))
    await userEvent.tab()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Required')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates on change by default', async () => {
    render(
      <Form<Client> onSubmit={() => {}}>
        <Input name="email" label="Email" rules={{ required: 'Required' }} />
      </Form>,
    )

    await userEvent.type(screen.getByLabelText('Email'), 'a')
    await userEvent.clear(screen.getByLabelText('Email'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Required')
  })

  it('leaves out fields that are not on screen', async () => {
    const onSubmit = vi.fn<SmartFormSubmitHandler<Client>>()
    function CompanySection() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}>
            Toggle company
          </button>
          {open ? <Input name="company" label="Company" /> : null}
        </>
      )
    }
    render(
      <Form<Client> defaultValues={{ name: 'Ada', is_company: true, company: 'ACME' }} onSubmit={onSubmit}>
        <Input name="name" label="Name" />
        <Checkbox name="is_company" label="Company?" />
        <CompanySection />
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Toggle company' }))
    await userEvent.click(screen.getByLabelText('Company?'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ada', is_company: false })
  })

  it('keeps shouldUnregister off when told to', async () => {
    const onSubmit = vi.fn<SmartFormSubmitHandler<Client>>()
    render(
      <Form<Client> defaultValues={{ name: 'Ada', company: 'ACME' }} onSubmit={onSubmit} shouldUnregister={false}>
        <Input name="name" label="Name" />
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0]![0]).toEqual({ name: 'Ada', company: 'ACME' })
  })

  it('shows new values when they change and keeps typed input when values are re-created but equal', async () => {
    function Host() {
      const [client, setClient] = useState({ name: 'Ada' })
      const [, rerender] = useState(0)
      return (
        <>
          <Form values={{ name: client.name }} onSubmit={() => {}}>
            <Input name="name" label="Name" />
          </Form>
          <button type="button" onClick={() => rerender((n) => n + 1)}>
            Rerender
          </button>
          <button type="button" onClick={() => setClient({ name: 'Grace' })}>
            Load Grace
          </button>
        </>
      )
    }
    render(<Host />)

    await userEvent.type(screen.getByLabelText('Name'), ' Lovelace')
    await userEvent.click(screen.getByRole('button', { name: 'Rerender' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace')

    await userEvent.click(screen.getByRole('button', { name: 'Load Grace' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Grace')
  })

  it('does not reset on new defaultValues', async () => {
    function Host() {
      const [client, setClient] = useState({ name: 'Ada' })
      return (
        <>
          <Form defaultValues={client} onSubmit={() => {}}>
            <Input name="name" label="Name" />
          </Form>
          <button type="button" onClick={() => setClient({ name: 'Grace' })}>
            Load Grace
          </button>
        </>
      )
    }
    render(<Host />)

    await userEvent.click(screen.getByRole('button', { name: 'Load Grace' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
  })

  it('lets onSubmit report server errors through the methods', async () => {
    render(
      <Form<Client>
        defaultValues={{ email: 'ada@example.com' }}
        onSubmit={(_values, _event, { setError }) => setError('email', { message: 'Already registered' })}
      >
        <Input name="email" label="Email" />
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Already registered')
  })

  it('is submitting until the promise onSubmit returns settles', async () => {
    let finish!: () => void
    const pending = new Promise<void>((resolve) => {
      finish = resolve
    })
    render(
      <Form onSubmit={() => pending}>
        <SubmitButton />
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    finish()
    expect(await screen.findByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('submit does not bubble to an enclosing form', async () => {
    const outer = vi.fn<(e: React.FormEvent) => void>((e) => e.preventDefault())
    const inner = vi.fn<SmartFormSubmitHandler>()
    function Dialog() {
      return createPortal(
        <Form onSubmit={inner}>
          <SubmitButton>Confirm</SubmitButton>
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

  it('hands the same submit function to descendants on every render', async () => {
    const seen = new Set<unknown>()
    function Probe() {
      seen.add(useSmartFormSubmit())
      return null
    }
    render(
      <Form onSubmit={() => {}}>
        <Input name="name" label="Name" />
        <Probe />
      </Form>,
    )

    await userEvent.type(screen.getByLabelText('Name'), 'Ada')
    expect(seen.size).toBe(1)
  })

  it('calls the latest onSubmit even though the submit function is stable', async () => {
    const first = vi.fn<SmartFormSubmitHandler>()
    const second = vi.fn<SmartFormSubmitHandler>()
    function Host() {
      const [handler, setHandler] = useState(() => first)
      return (
        <>
          <Form onSubmit={handler}>
            <SubmitButton />
          </Form>
          <button type="button" onClick={() => setHandler(() => second)}>
            Swap
          </button>
        </>
      )
    }
    render(<Host />)

    await userEvent.click(screen.getByRole('button', { name: 'Swap' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
