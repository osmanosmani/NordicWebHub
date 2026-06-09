import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createTicket,
  getMyTickets,
  replyToTicket,
} from '../../api/ticketsApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextInput } from '../../components/ui/TextInput'
import type {
  CreateSupportTicketDto,
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from '../../types/supportTicket'
import { getErrorMessage } from '../../utils/getErrorMessage'

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
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <div className="grid gap-6">
          <form
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-950">New ticket</h2>
              <p className="mt-1 text-sm text-slate-500">
                Tell us what needs attention.
              </p>
            </div>

            <div className="grid gap-4">
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

              <label className="grid gap-2" htmlFor="description">
                <span className="form-label">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  id="description"
                  maxLength={2000}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  required
                  value={form.description}
                />
              </label>

              <label className="grid gap-2" htmlFor="priority">
                <span className="form-label">Priority</span>
                <select
                  className="form-input"
                  id="priority"
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
                </select>
              </label>
            </div>

            <div className="mt-6">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Creating' : 'Create ticket'}
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
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">My tickets</h2>
        <p className="mt-1 text-sm text-slate-500">Open a ticket to reply.</p>
      </div>

      {isLoading ? (
        <div className="p-5 text-sm font-medium text-slate-600">
          Loading tickets
        </div>
      ) : null}

      {!isLoading && tickets.length === 0 ? (
        <div className="p-5 text-sm text-slate-600">
          No support tickets have been created yet.
        </div>
      ) : null}

      {!isLoading && tickets.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <button
              className={
                ticket.id === selectedTicketId
                  ? 'w-full bg-emerald-50 p-5 text-left'
                  : 'w-full bg-white p-5 text-left hover:bg-slate-50'
              }
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              type="button"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{ticket.title}</p>
                <StatusBadge
                  label={ticket.status}
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
    </div>
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
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Select a ticket to view the message thread.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{ticket.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{ticket.companyName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={ticket.status}
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
          <h3 className="text-sm font-semibold uppercase text-slate-500">
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
            <label className="grid gap-2" htmlFor="ticketReply">
              <span className="form-label">Reply</span>
              <textarea
                className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="ticketReply"
                maxLength={4000}
                onChange={(event) => setReplyMessage(event.target.value)}
                required
                value={replyMessage}
              />
            </label>
            <div className="mt-4">
              <Button disabled={isReplying || !replyMessage.trim()} type="submit">
                {isReplying ? 'Sending' : 'Send reply'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
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

function getTicketStatusTone(status: TicketStatus) {
  const tones: Record<TicketStatus, 'blue' | 'emerald' | 'amber' | 'slate'> = {
    Closed: 'slate',
    InProgress: 'blue',
    Open: 'emerald',
    WaitingForCustomer: 'amber',
  }

  return tones[status]
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
