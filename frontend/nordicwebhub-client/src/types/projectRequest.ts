export type ProjectRequestStatus = 'New' | 'Reviewed' | 'Approved' | 'Rejected'

export type ProjectRequest = {
  id: number
  companyId: number
  companyName: string
  servicePackageId: number
  servicePackageName: string
  customerId: string
  customerEmail: string
  title: string
  description: string
  budgetRange: string
  status: ProjectRequestStatus
  createdAt: string
}

export type CreateProjectRequestDto = {
  servicePackageId: number
  title: string
  description: string
  budgetRange: string
}

export type UpdateProjectRequestStatusDto = {
  status: ProjectRequestStatus
}
