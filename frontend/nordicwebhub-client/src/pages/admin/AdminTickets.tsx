import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  getTickets,
  replyToTicket,
  updateTicketPriority,
  updateTicketStatus,
} from '../../api/ticketsApi'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TextArea } from '../../components/ui/TextArea'
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from '../../types/supportTicket'
import { getErrorMessage } from '../../utils/getErrorMessage'
import {
  getTicketStatusLabel,
  getTicketStatusTone,
  ticketStatuses,
} from '../../utils/ticketStatus'

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
        <ErrorMessage className="mt-6" message={error} />
      ) : null}

      {successMessage ? (
        <Alert className="mt-6" tone="success">
          {successMessage}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
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
    <Card
      description="Open a ticket to view its message thread."
      title="All tickets"
    >
      {isLoading ? (
        <div className="flex items-center gap-3 p-5 text-sm font-medium text-slate-600">
          <LoadingSpinner label="Loading tickets" />
          <span>Loading tickets</span>
        </div>
      ) : null}

      {!isLoading && tickets.length === 0 ? (
        <EmptyState
          compact
          description="Customer support conversations will appear here."
          title="No support tickets yet"
        />
      ) : null}

      {!isLoading && tickets.length > 0 ? (
        <>
          <div className="divide-y divide-slate-200 md:hidden">
            {tickets.map((ticket) => (
              <article
                className={
                  ticket.id === selectedTicketId
                    ? 'bg-blue-50/50 p-5'
                    : 'p-5'
                }
                key={ticket.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-950">
                      {ticket.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {ticket.companyName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={getTicketStatusLabel(ticket.status)}
                      showDot
                      tone={getTicketStatusTone(ticket.status)}
                    />
                    <StatusBadge
                      label={ticket.priority}
                      tone={getTicketPriorityTone(ticket.priority)}
                    />
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {ticket.description}
                </p>
                <p className="mt-3 text-xs font-medium text-slate-400">
                  {ticket.customerEmail} · {formatDate(ticket.createdAt)}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Select
                    disabled={updatingTicketId === ticket.id}
                    id={`mobile-ticket-status-${ticket.id}`}
                    label="Status"
                    onChange={(event) =>
                      onStatusChange(
                        ticket,
                        event.target.value as TicketStatus,
                      )
                    }
                    value={ticket.status}
                  >
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getTicketStatusLabel(status)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    disabled={updatingTicketId === ticket.id}
                    id={`mobile-ticket-priority-${ticket.id}`}
                    label="Priority"
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
                  </Select>
                </div>
                <Button
                  className="mt-5"
                  onClick={() => onSelectTicket(ticket.id)}
                  size="sm"
                  variant="secondary"
                >
                  Open ticket
                </Button>
              </article>
            ))}
          </div>
          <DataTable
            className="min-w-[900px]"
            scrollLabel="Support tickets table"
            showMobileHint={false}
            wrapperClassName="hidden md:block"
          >
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
                    <Select
                      className="h-10 min-w-36 font-semibold"
                      disabled={updatingTicketId === ticket.id}
                      hideLabel
                      id={`ticket-status-${ticket.id}`}
                      label={`Status for ${ticket.title}`}
                      onChange={(event) =>
                        onStatusChange(ticket, event.target.value as TicketStatus)
                      }
                      value={ticket.status}
                    >
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getTicketStatusLabel(status)}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Select
                      className="h-10 min-w-28 font-semibold"
                      disabled={updatingTicketId === ticket.id}
                      hideLabel
                      id={`ticket-priority-${ticket.id}`}
                      label={`Priority for ${ticket.title}`}
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
                    </Select>
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
          </DataTable>
        </>
      ) : null}
    </Card>
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
      <Card>
        <EmptyState
          compact
          description="Choose a ticket from the list to see its conversation."
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
            <p className="mt-1 text-sm text-slate-500">
              {ticket.customerEmail} - {ticket.companyName}
            </p>
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

      <div className="grid gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            disabled={updatingTicketId === ticket.id}
            id="selectedTicketStatus"
            label="Status"
            onChange={(event) =>
              onStatusChange(ticket, event.target.value as TicketStatus)
            }
            value={ticket.status}
          >
            {ticketStatuses.map((status) => (
              <option key={status} value={status}>
                {getTicketStatusLabel(status)}
              </option>
            ))}
          </Select>

          <Select
            disabled={updatingTicketId === ticket.id}
            id="selectedTicketPriority"
            label="Priority"
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
          </Select>
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
          <TextArea
            id="adminTicketReply"
            label="Reply"
            maxLength={4000}
            onChange={(event) => setReplyMessage(event.target.value)}
            required
            value={replyMessage}
          />
          <div className="mt-4">
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
