import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createTicket,
  getMyTickets,
  replyToTicket,
} from '../../api/ticketsApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import type {
  CreateSupportTicketDto,
  SupportTicket,
  TicketPriority,
} from '../../types/supportTicket'
import { getErrorMessage } from '../../utils/getErrorMessage'
import {
  getTicketStatusLabel,
  getTicketStatusTone,
} from '../../utils/ticketStatus'

type TicketFormState = {
  title: string
  description: string
  priority: TicketPriority
}

const emptyForm: TicketFormState = {
  title: '',
  description: '',
  priority: 'Medium',
}

const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent']

export function CustomerTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [form, setForm] = useState<TicketFormState>(emptyForm)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0],
    [selectedTicketId, tickets],
  )

  useEffect(() => {
    let isMounted = true

    async function loadTickets() {
      setIsLoading(true)
      setError('')

      try {
        const loadedTickets = await getMyTickets()

        if (isMounted) {
          setTickets(loadedTickets)
          setSelectedTicketId((currentId) => currentId ?? loadedTickets[0]?.id ?? null)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getErrorMessage(loadError, 'Could not load tickets. Please try again.'),
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTickets()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const createdTicket = await createTicket(toPayload(form))
      setTickets((currentTickets) => [createdTicket, ...currentTickets])
      setSelectedTicketId(createdTicket.id)
      setForm(emptyForm)
      setSuccessMessage('Ticket created.')
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Could not create ticket. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedTicket) {
      return
    }

    setIsReplying(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedTicket = await replyToTicket(selectedTicket.id, {
        message: replyMessage.trim(),
      })

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket,
        ),
      )
      setReplyMessage('')
      setSuccessMessage('Reply added.')
    } catch (replyError) {
      setError(getErrorMessage(replyError, 'Could not add reply. Please try again.'))
    } finally {
      setIsReplying(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Create support tickets and keep the conversation in one thread."
        eyebrow="Customer"
        title="Support Tickets"
      />

      {error ? (
        <ErrorMessage className="mt-6" message={error} />
      ) : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="grid gap-6">
          <form
            className="form-panel"
            onSubmit={handleSubmit}
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">New ticket</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tell us what needs attention.
              </p>
            </div>

            <div className="form-stack">
              <TextInput
                id="title"
                label="Title"
                maxLength={200}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                required
                value={form.title}
              />

              <TextArea
                id="description"
                label="Description"
                maxLength={2000}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
                value={form.description}
              />

              <Select
                id="priority"
                label="Priority"
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value as TicketPriority,
                  })
                }
                value={form.priority}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </div>

            <div className="form-actions">
              <Button
                isLoading={isSaving}
                loadingLabel="Creating"
                type="submit"
              >
                Create ticket
              </Button>
            </div>
          </form>

          <TicketList
            isLoading={isLoading}
            onSelectTicket={setSelectedTicketId}
            selectedTicketId={selectedTicket?.id ?? null}
            tickets={tickets}
          />
        </div>

        <TicketDetail
          isReplying={isReplying}
          onReply={handleReply}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          ticket={selectedTicket}
        />
      </div>
    </section>
  )
}

function TicketList({
  isLoading,
  onSelectTicket,
  selectedTicketId,
  tickets,
}: {
  isLoading: boolean
  onSelectTicket: (id: number) => void
  selectedTicketId: number | null
  tickets: SupportTicket[]
}) {
  return (
    <Card description="Open a ticket to reply." title="My tickets">
      {isLoading ? (
        <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
          <LoadingSpinner label="Loading tickets" />
          <span>Loading tickets</span>
        </div>
      ) : null}

      {!isLoading && tickets.length === 0 ? (
        <EmptyState
          compact
          description="Use the form above to start a support conversation."
          title="No support tickets yet"
        />
      ) : null}

      {!isLoading && tickets.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <button
              className={
                ticket.id === selectedTicketId
                  ? 'w-full bg-blue-50 p-5 text-left'
                  : 'w-full bg-white p-5 text-left hover:bg-slate-50'
              }
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              type="button"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{ticket.title}</p>
                <StatusBadge
                  label={getTicketStatusLabel(ticket.status)}
                  tone={getTicketStatusTone(ticket.status)}
                />
                <StatusBadge
                  label={ticket.priority}
                  tone={getTicketPriorityTone(ticket.priority)}
                />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {ticket.description}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {formatDate(ticket.createdAt)}
              </p>
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  )
}

function TicketDetail({
  isReplying,
  onReply,
  replyMessage,
  setReplyMessage,
  ticket,
}: {
  isReplying: boolean
  onReply: (event: FormEvent<HTMLFormElement>) => void
  replyMessage: string
  setReplyMessage: (value: string) => void
  ticket?: SupportTicket
}) {
  if (!ticket) {
    return (
      <Card>
        <EmptyState
          compact
          description="Choose a ticket to see its conversation and reply."
          title="Select a ticket"
        />
      </Card>
    )
  }

  return (
    <Card>
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{ticket.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{ticket.companyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={getTicketStatusLabel(ticket.status)}
              tone={getTicketStatusTone(ticket.status)}
            />
            <StatusBadge
              label={ticket.priority}
              tone={getTicketPriorityTone(ticket.priority)}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-slate-700">{ticket.description}</p>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">
            Message thread
          </h3>

          <div className="mt-4 grid gap-4">
            <ThreadMessage
              createdAt={ticket.createdAt}
              message={ticket.description}
              name={ticket.customerEmail}
            />
            {ticket.replies.map((reply) => (
              <ThreadMessage
                createdAt={reply.createdAt}
                key={reply.id}
                message={reply.message}
                name={reply.userFullName || reply.userEmail}
              />
            ))}
          </div>
        </div>

        {ticket.status === 'Closed' ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            This ticket is closed. The team can reopen it if more work is needed.
          </div>
        ) : (
          <form className="mt-6" onSubmit={onReply}>
            <TextArea
              id="ticketReply"
              label="Reply"
              maxLength={4000}
              onChange={(event) => setReplyMessage(event.target.value)}
              required
              value={replyMessage}
            />
            <div className="form-actions mt-4">
              <Button
                disabled={!replyMessage.trim()}
                isLoading={isReplying}
                loadingLabel="Sending"
                type="submit"
              >
                Send reply
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}

function ThreadMessage({
  createdAt,
  message,
  name,
}: {
  createdAt: string
  message: string
  name: string
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-950">{name}</p>
        <p className="text-xs font-medium text-slate-500">{formatDateTime(createdAt)}</p>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
        {message}
      </p>
    </article>
  )
}

function toPayload(form: TicketFormState): CreateSupportTicketDto {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getTicketPriorityTone(priority: TicketPriority) {
  const tones: Record<TicketPriority, 'amber' | 'red' | 'slate'> = {
    High: 'amber',
    Low: 'slate',
    Medium: 'slate',
    Urgent: 'red',
  }

  return tones[priority]
}
