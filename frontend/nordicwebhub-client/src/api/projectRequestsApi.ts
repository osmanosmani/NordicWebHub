import { axiosClient } from './axiosClient'
import type {
  CreateProjectRequestDto,
  ProjectRequest,
  UpdateProjectRequestStatusDto,
} from '../types/projectRequest'

export async function getProjectRequests() {
  const response = await axiosClient.get<ProjectRequest[]>('/project-requests')

  return response.data
}

export async function getProjectRequest(id: number) {
  const response = await axiosClient.get<ProjectRequest>(`/project-requests/${id}`)

  return response.data
}

export async function getMyProjectRequests() {
  const response = await axiosClient.get<ProjectRequest[]>('/project-requests/my')

  return response.data
}

export async function createProjectRequest(dto: CreateProjectRequestDto) {
  const response = await axiosClient.post<ProjectRequest>('/project-requests', dto)

  return response.data
}

export async function updateProjectRequestStatus(
  id: number,
  dto: UpdateProjectRequestStatusDto,
) {
  const response = await axiosClient.put<ProjectRequest>(
    `/project-requests/${id}/status`,
    dto,
  )

  return response.data
}
