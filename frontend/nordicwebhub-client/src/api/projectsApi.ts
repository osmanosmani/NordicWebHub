import { axiosClient } from './axiosClient'
import type {
  CreateProjectDto,
  Project,
  UpdateProjectDto,
  UpdateProjectStatusDto,
} from '../types/project'

export async function getProjects() {
  const response = await axiosClient.get<Project[]>('/projects')

  return response.data
}

export async function getProject(id: number) {
  const response = await axiosClient.get<Project>(`/projects/${id}`)

  return response.data
}

export async function getMyProjects() {
  const response = await axiosClient.get<Project[]>('/projects/my')

  return response.data
}

export async function createProject(dto: CreateProjectDto) {
  const response = await axiosClient.post<Project>('/projects', dto)

  return response.data
}

export async function createProjectFromRequest(
  requestId: number,
  dto: CreateProjectDto,
) {
  const response = await axiosClient.post<Project>(
    `/projects/from-request/${requestId}`,
    dto,
  )

  return response.data
}

export async function updateProject(id: number, dto: UpdateProjectDto) {
  const response = await axiosClient.put<Project>(`/projects/${id}`, dto)

  return response.data
}

export async function updateProjectStatus(
  id: number,
  dto: UpdateProjectStatusDto,
) {
  const response = await axiosClient.put<Project>(`/projects/${id}/status`, dto)

  return response.data
}

export async function deleteProject(id: number) {
  await axiosClient.delete(`/projects/${id}`)
}
