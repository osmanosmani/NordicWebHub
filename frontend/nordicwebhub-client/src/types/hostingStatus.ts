export type HostingStatus = {
  id: number
  companyId: number
  companyName: string
  domainName: string
  isOnline: boolean
  lastCheckedAt: string
  statusCode: number
  notes: string
}

export type WebsiteCheckSummary = {
  checkedCount: number
  onlineCount: number
  failedCount: number
}
