import type {
  CreateMaintenanceLogDto,
  MaintenanceLog,
  UpdateMaintenanceLogDto,
} from '../types/maintenanceLog'
import { axiosClient } from './axiosClient'

export async function getMaintenanceLogs() {
  const response = await axiosClient.get<MaintenanceLog[]>('/maintenance-logs')

  return response.data
}

export async function getMyMaintenanceLogs() {
  const response = await axiosClient.get<MaintenanceLog[]>(
    '/maintenance-logs/my',
  )

  return response.data
}

export async function createMaintenanceLog(dto: CreateMaintenanceLogDto) {
  const response = await axiosClient.post<MaintenanceLog>(
    '/maintenance-logs',
    dto,
  )

  return response.data
}

export async function updateMaintenanceLog(
  id: number,
  dto: UpdateMaintenanceLogDto,
) {
  const response = await axiosClient.put<MaintenanceLog>(
    `/maintenance-logs/${id}`,
    dto,
  )

  return response.data
}

export async function deleteMaintenanceLog(id: number) {
  await axiosClient.delete(`/maintenance-logs/${id}`)
}
