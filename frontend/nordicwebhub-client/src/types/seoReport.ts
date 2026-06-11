export type SeoReport = {
  id: number
  companyId: number
  companyName: string
  seoScore: number
  topKeywords: string
  technicalIssues: string
  recommendations: string
  createdAt: string
}

export type CreateSeoReportDto = {
  companyId: number
  seoScore: number
  topKeywords: string
  technicalIssues: string
  recommendations: string
}

export type UpdateSeoReportDto = CreateSeoReportDto
