export type MaintenanceLog = {
  id: number
  companyId: number
  companyName: string
  title: string
  description: string
  actionTaken: string
  result: string
  createdAt: string
}

export type CreateMaintenanceLogDto = {
  companyId: number
  title: string
  description: string
  actionTaken: string
  result: string
}

export type UpdateMaintenanceLogDto = CreateMaintenanceLogDto
