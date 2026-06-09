import { axiosClient } from './axiosClient'
import type {
  CreateServicePackageDto,
  ServicePackage,
  UpdateServicePackageDto,
} from '../types/servicePackage'

export async function getPackages() {
  const response = await axiosClient.get<ServicePackage[]>('/packages')

  return response.data
}

export async function getPackage(id: number) {
  const response = await axiosClient.get<ServicePackage>(`/packages/${id}`)

  return response.data
}

export async function createPackage(dto: CreateServicePackageDto) {
  const response = await axiosClient.post<ServicePackage>('/packages', dto)

  return response.data
}

export async function updatePackage(id: number, dto: UpdateServicePackageDto) {
  const response = await axiosClient.put<ServicePackage>(`/packages/${id}`, dto)

  return response.data
}

export async function deletePackage(id: number) {
  await axiosClient.delete(`/packages/${id}`)
}
