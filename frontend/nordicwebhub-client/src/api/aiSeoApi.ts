import type {
  AiSeoRequestResult,
  AiSeoResult,
  GenerateAiSeoRequestDto,
} from '../types/aiSeo'
import { axiosClient } from './axiosClient'

export async function generateAiSeoResult(dto: GenerateAiSeoRequestDto) {
  const response = await axiosClient.post<AiSeoResult>('/ai-seo/generate', dto)

  return response.data
}

export async function getMyAiSeoResults() {
  const response =
    await axiosClient.get<AiSeoRequestResult[]>('/ai-seo/my-results')

  return response.data
}
