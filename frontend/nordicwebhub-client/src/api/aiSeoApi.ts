import type {
  AiSeoRequestResult,
  AiSeoResult,
  AiServiceRecommendationInput,
  AiServiceRecommendationRequestResult,
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

export async function generateAiServiceRecommendation(
  dto: AiServiceRecommendationInput,
) {
  const response =
    await axiosClient.post<AiServiceRecommendationRequestResult>(
      '/ai-seo/service-recommendation',
      dto,
    )

  return response.data
}

export async function getMyAiServiceRecommendations() {
  const response =
    await axiosClient.get<AiServiceRecommendationRequestResult[]>(
      '/ai-seo/my-service-results',
    )

  return response.data
}

export async function getAiServiceRecommendations() {
  const response =
    await axiosClient.get<AiServiceRecommendationRequestResult[]>(
      '/ai-seo/service-results',
    )

  return response.data
}
