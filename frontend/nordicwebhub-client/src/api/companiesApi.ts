import { axiosClient } from './axiosClient'
import type {
  Company,
  CreateCompanyDto,
  UpdateMyCompanyDto,
  UpdateCompanyDto,
} from '../types/company'

export async function getCompanies() {
  const response = await axiosClient.get<Company[]>('/companies')

  return response.data
}

export async function getCompany(id: number) {
  const response = await axiosClient.get<Company>(`/companies/${id}`)

  return response.data
}

export async function getMyCompany() {
  const response = await axiosClient.get<Company>('/companies/my')

  return response.data
}

export async function createCompany(dto: CreateCompanyDto) {
  const response = await axiosClient.post<Company>('/companies', dto)

  return response.data
}

export async function updateCompany(id: number, dto: UpdateCompanyDto) {
  const response = await axiosClient.put<Company>(`/companies/${id}`, dto)

  return response.data
}

export async function updateMyCompany(id: number, dto: UpdateMyCompanyDto) {
  const response = await axiosClient.put<Company>(`/companies/${id}`, dto)

  return response.data
}

export async function deleteCompany(id: number) {
  await axiosClient.delete(`/companies/${id}`)
}
