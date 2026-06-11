import type {
  CreateSeoReportDto,
  SeoReport,
  UpdateSeoReportDto,
} from '../types/seoReport'
import { axiosClient } from './axiosClient'

export async function getSeoReports() {
  const response = await axiosClient.get<SeoReport[]>('/seo-reports')

  return response.data
}

export async function getMySeoReports() {
  const response = await axiosClient.get<SeoReport[]>('/seo-reports/my')

  return response.data
}

export async function createSeoReport(dto: CreateSeoReportDto) {
  const response = await axiosClient.post<SeoReport>('/seo-reports', dto)

  return response.data
}

export async function updateSeoReport(
  id: number,
  dto: UpdateSeoReportDto,
) {
  const response = await axiosClient.put<SeoReport>(`/seo-reports/${id}`, dto)

  return response.data
}

export async function deleteSeoReport(id: number) {
  await axiosClient.delete(`/seo-reports/${id}`)
}
