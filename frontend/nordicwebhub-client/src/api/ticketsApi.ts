import { axiosClient } from './axiosClient'
import type {
  CreateSupportTicketDto,
  CreateTicketReplyDto,
  SupportTicket,
  UpdateTicketPriorityDto,
  UpdateTicketStatusDto,
} from '../types/supportTicket'

export async function getTickets() {
  const response = await axiosClient.get<SupportTicket[]>('/tickets')

  return response.data
}

export async function getTicket(id: number) {
  const response = await axiosClient.get<SupportTicket>(`/tickets/${id}`)

  return response.data
}

export async function getMyTickets() {
  const response = await axiosClient.get<SupportTicket[]>('/tickets/my')

  return response.data
}

export async function createTicket(dto: CreateSupportTicketDto) {
  const response = await axiosClient.post<SupportTicket>('/tickets', dto)

  return response.data
}

export async function replyToTicket(id: number, dto: CreateTicketReplyDto) {
  const response = await axiosClient.post<SupportTicket>(
    `/tickets/${id}/reply`,
    dto,
  )

  return response.data
}

export async function updateTicketStatus(
  id: number,
  dto: UpdateTicketStatusDto,
) {
  const response = await axiosClient.put<SupportTicket>(
    `/tickets/${id}/status`,
    dto,
  )

  return response.data
}

export async function updateTicketPriority(
  id: number,
  dto: UpdateTicketPriorityDto,
) {
  const response = await axiosClient.put<SupportTicket>(
    `/tickets/${id}/priority`,
    dto,
  )

  return response.data
}
