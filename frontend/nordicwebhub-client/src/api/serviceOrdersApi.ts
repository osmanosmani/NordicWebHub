import type {
  CreateServiceOrderDto,
  ServiceOrder,
  UpdateServiceOrderStatusDto,
} from '../types/serviceOrder'
import { axiosClient } from './axiosClient'

export async function getServiceOrders() {
  const response = await axiosClient.get<ServiceOrder[]>('/service-orders')

  return response.data
}

export async function getServiceOrder(id: number) {
  const response = await axiosClient.get<ServiceOrder>(`/service-orders/${id}`)

  return response.data
}

export async function getMyServiceOrders() {
  const response = await axiosClient.get<ServiceOrder[]>('/service-orders/my')

  return response.data
}

export async function createServiceOrder(dto: CreateServiceOrderDto) {
  const response = await axiosClient.post<ServiceOrder>('/service-orders', dto)

  return response.data
}

export async function updateServiceOrderStatus(
  id: number,
  dto: UpdateServiceOrderStatusDto,
) {
  const response = await axiosClient.put<ServiceOrder>(
    `/service-orders/${id}/status`,
    dto,
  )

  return response.data
}
