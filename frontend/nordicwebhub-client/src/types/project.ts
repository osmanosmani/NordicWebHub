export type ProjectStatus =
  | 'Planning'
  | 'Design'
  | 'Development'
  | 'Review'
  | 'Live'
  | 'Completed'

export type Project = {
  id: number
  companyId: number
  companyName: string
  projectRequestId: number | null
  projectRequestTitle: string
  title: string
  description: string
  status: ProjectStatus
  startDate: string
  deadline: string
  createdAt: string
}

export type CreateProjectDto = {
  companyId?: number
  projectRequestId?: number | null
  title: string
  description: string
  status: ProjectStatus
  startDate: string
  deadline: string
}

export type UpdateProjectDto = {
  companyId: number
  projectRequestId?: number | null
  title: string
  description: string
  startDate: string
  deadline: string
}

export type UpdateProjectStatusDto = {
  status: ProjectStatus
}
