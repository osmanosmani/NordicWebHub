export type DashboardCompany = {
  id: number
  name: string
  orgNumber: string
  websiteUrl: string
  city: string
  industry: string
  phone: string
}

export type DashboardProject = {
  id: number
  companyId: number
  companyName: string
  title: string
  status: string
  startDate: string
  deadline: string
  createdAt: string
}

export type DashboardProjectRequest = {
  id: number
  companyId: number
  companyName: string
  customerEmail: string
  servicePackageId: number
  servicePackageName: string
  title: string
  status: string
  createdAt: string
}

export type DashboardSupportTicket = {
  id: number
  companyId: number
  companyName: string
  customerEmail: string
  title: string
  status: string
  priority: string
  createdAt: string
}

export type AdminDashboardData = {
  totalCustomers: number
  totalCompanies: number
  totalProjectRequests: number
  pendingProjectRequests: number
  activeProjects: number
  openTickets: number
  recentProjectRequests: DashboardProjectRequest[]
  recentSupportTickets: DashboardSupportTicket[]
  recentProjects: DashboardProject[]
}

export type CustomerDashboardData = {
  company: DashboardCompany | null
  activeProjects: DashboardProject[]
  openTickets: DashboardSupportTicket[]
  recentProjectRequests: DashboardProjectRequest[]
  recentSupportTickets: DashboardSupportTicket[]
}
