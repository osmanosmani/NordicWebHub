import type {
  AdminDashboardData,
  CustomerDashboardData,
} from '../types/dashboard'
import { axiosClient } from './axiosClient'

export async function getAdminDashboard() {
  const response = await axiosClient.get<AdminDashboardData>('/dashboard/admin')

  return response.data
}

export async function getCustomerDashboard() {
  const response =
    await axiosClient.get<CustomerDashboardData>('/dashboard/customer')

  return response.data
}
