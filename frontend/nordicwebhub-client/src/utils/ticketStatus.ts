import type { TicketStatus } from '../types/supportTicket'

export const ticketStatuses: TicketStatus[] = [
  'Open',
  'InProgress',
  'WaitingForCustomer',
  'Closed',
]

export function getTicketStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    Closed: 'Closed',
    InProgress: 'In progress',
    Open: 'Open',
    WaitingForCustomer: 'Waiting for customer',
  }

  return labels[status]
}

export function getTicketStatusTone(
  status: TicketStatus,
): 'blue' | 'emerald' | 'amber' | 'slate' {
  const tones: Record<
    TicketStatus,
    'blue' | 'emerald' | 'amber' | 'slate'
  > = {
    Closed: 'slate',
    InProgress: 'blue',
    Open: 'emerald',
    WaitingForCustomer: 'amber',
  }

  return tones[status]
}
