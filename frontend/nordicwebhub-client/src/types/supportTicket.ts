export type TicketStatus = 'Open' | 'InProgress' | 'WaitingForCustomer' | 'Closed'

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type TicketReply = {
  id: number
  supportTicketId: number
  userId: string
  userEmail: string
  userFullName: string
  message: string
  createdAt: string
}

export type SupportTicket = {
  id: number
  companyId: number
  companyName: string
  customerId: string
  customerEmail: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  closedAt: string | null
  replies: TicketReply[]
}

export type CreateSupportTicketDto = {
  title: string
  description: string
  priority: TicketPriority
}

export type CreateTicketReplyDto = {
  message: string
}

export type UpdateTicketStatusDto = {
  status: TicketStatus
}

export type UpdateTicketPriorityDto = {
  priority: TicketPriority
}
