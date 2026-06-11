import type {
  HostingStatus,
  WebsiteCheckSummary,
} from '../types/hostingStatus'
import { axiosClient } from './axiosClient'

export async function getHostingStatuses() {
  const response =
    await axiosClient.get<HostingStatus[]>('/hosting-statuses')

  return response.data
}

export async function getMyHostingStatuses() {
  const response = await axiosClient.get<HostingStatus[]>(
    '/hosting-statuses/my',
  )

  return response.data
}

export async function runWebsiteCheck() {
  const response = await axiosClient.post<WebsiteCheckSummary>(
    '/website-check/run',
  )

  return response.data
}
