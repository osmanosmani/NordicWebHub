import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  getTickets,
  replyToTicket,
  updateTicketPriority,
  updateTicketStatus,
} from '../../api/ticketsApi'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from '../../types/supportTicket'
import { getErrorMessage } from '../../utils/getErrorMessage'

const statuses: TicketStatus[] = [
  'Open',
  'InProgress',
  'WaitingForCustomer',
  'Closed',
]

const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent']

export function AdminTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isReplying, setIsReplying] = useState(false)
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null)
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
        const loadedTickets = await getTickets()

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

      replaceTicket(updatedTicket)
      setReplyMessage('')
      setSuccessMessage('Reply added.')
    } catch (replyError) {
      setError(getErrorMessage(replyError, 'Could not add reply. Please try again.'))
    } finally {
      setIsReplying(false)
    }
  }

  async function handleStatusChange(ticket: SupportTicket, status: TicketStatus) {
    if (ticket.status === status) {
      return
    }

    setUpdatingTicketId(ticket.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedTicket = await updateTicketStatus(ticket.id, { status })
      replaceTicket(updatedTicket)
      setSuccessMessage('Ticket status updated.')
    } catch (statusError) {
      setError(
        getErrorMessage(statusError, 'Could not update ticket status. Please try again.'),
      )
    } finally {
      setUpdatingTicketId(null)
    }
  }

  async function handlePriorityChange(
    ticket: SupportTicket,
    priority: TicketPriority,
  ) {
    if (ticket.priority === priority) {
      return
    }

    setUpdatingTicketId(ticket.id)
    setError('')
    setSuccessMessage('')

    try {
      const updatedTicket = await updateTicketPriority(ticket.id, { priority })
      replaceTicket(updatedTicket)
      setSuccessMessage('Ticket priority updated.')
    } catch (priorityError) {
      setError(
        getErrorMessage(
          priorityError,
          'Could not update ticket priority. Please try again.',
        ),
      )
    } finally {
      setUpdatingTicketId(null)
    }
  }

  function replaceTicket(updatedTicket: SupportTicket) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket,
      ),
    )
  }

  return (
    <section>
      <PageHeader
        description="Review support conversations, reply to customers, and manage status and priority."
        eyebrow="Admin"
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TicketTable
          isLoading={isLoading}
          onPriorityChange={handlePriorityChange}
          onSelectTicket={setSelectedTicketId}
          onStatusChange={handleStatusChange}
          selectedTicketId={selectedTicket?.id ?? null}
          tickets={tickets}
          updatingTicketId={updatingTicketId}
        />

        <TicketDetail
          isReplying={isReplying}
          onPriorityChange={handlePriorityChange}
          onReply={handleReply}
          onStatusChange={handleStatusChange}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          ticket={selectedTicket}
          updatingTicketId={updatingTicketId}
        />
      </div>
    </section>
  )
}

function TicketTable({
  isLoading,
  onPriorityChange,
  onSelectTicket,
  onStatusChange,
  selectedTicketId,
  tickets,
  updatingTicketId,
}: {
  isLoading: boolean
  onPriorityChange: (ticket: SupportTicket, priority: TicketPriority) => void
  onSelectTicket: (id: number) => void
  onStatusChange: (ticket: SupportTicket, status: TicketStatus) => void
  selectedTicketId: number | null
  tickets: SupportTicket[]
  updatingTicketId: number | null
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">All tickets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Open a ticket to view its message thread.
        </p>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Ticket</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((ticket) => (
                <tr
                  className={ticket.id === selectedTicketId ? 'bg-blue-50/50' : ''}
                  key={ticket.id}
                >
                  <td className="max-w-md px-5 py-4 align-top">
                    <p className="font-semibold text-slate-950">{ticket.title}</p>
                    <p className="mt-1 line-clamp-2 text-slate-500">
                      {ticket.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-700">
                    <p>{ticket.customerEmail}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.companyName}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <label className="sr-only" htmlFor={`ticket-status-${ticket.id}`}>
                      Status for {ticket.title}
                    </label>
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                      disabled={updatingTicketId === ticket.id}
                      id={`ticket-status-${ticket.id}`}
                      onChange={(event) =>
                        onStatusChange(ticket, event.target.value as TicketStatus)
                      }
                      value={ticket.status}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <label
                      className="sr-only"
                      htmlFor={`ticket-priority-${ticket.id}`}
                    >
                      Priority for {ticket.title}
                    </label>
                    <select
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                      disabled={updatingTicketId === ticket.id}
                      id={`ticket-priority-${ticket.id}`}
                      onChange={(event) =>
                        onPriorityChange(
                          ticket,
                          event.target.value as TicketPriority,
                        )
                      }
                      value={ticket.priority}
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Button
                      className="h-10 px-3"
                      onClick={() => onSelectTicket(ticket.id)}
                      variant="secondary"
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

function TicketDetail({
  isReplying,
  onPriorityChange,
  onReply,
  onStatusChange,
  replyMessage,
  setReplyMessage,
  ticket,
  updatingTicketId,
}: {
  isReplying: boolean
  onPriorityChange: (ticket: SupportTicket, priority: TicketPriority) => void
  onReply: (event: FormEvent<HTMLFormElement>) => void
  onStatusChange: (ticket: SupportTicket, status: TicketStatus) => void
  replyMessage: string
  setReplyMessage: (value: string) => void
  ticket?: SupportTicket
  updatingTicketId: number | null
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
            <p className="mt-1 text-sm text-slate-500">
              {ticket.customerEmail} - {ticket.companyName}
            </p>
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

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2" htmlFor="selectedTicketStatus">
            <span className="form-label">Status</span>
            <select
              className="form-input"
              disabled={updatingTicketId === ticket.id}
              id="selectedTicketStatus"
              onChange={(event) =>
                onStatusChange(ticket, event.target.value as TicketStatus)
              }
              value={ticket.status}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2" htmlFor="selectedTicketPriority">
            <span className="form-label">Priority</span>
            <select
              className="form-input"
              disabled={updatingTicketId === ticket.id}
              id="selectedTicketPriority"
              onChange={(event) =>
                onPriorityChange(ticket, event.target.value as TicketPriority)
              }
              value={ticket.priority}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-sm leading-6 text-slate-700">{ticket.description}</p>

        <div>
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

        <form onSubmit={onReply}>
          <label className="grid gap-2" htmlFor="adminTicketReply">
            <span className="form-label">Reply</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              id="adminTicketReply"
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
