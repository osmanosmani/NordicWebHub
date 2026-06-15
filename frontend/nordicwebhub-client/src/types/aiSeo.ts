export type AiSeoBlogPostIdea = {
  title: string
  focus: string
}

export type AiSeoResult = {
  localKeywords: string[]
  blogPostIdeas: AiSeoBlogPostIdea[]
  metaTitle: string
  metaDescription: string
  recommendations: string[]
}

export type GenerateAiSeoRequestDto = {
  industry: string
  city: string
}

export type AiSeoRequestResult = {
  id: number
  companyId: number
  companyName: string
  industry: string
  city: string
  result: AiSeoResult
  createdAt: string
}

export type AiServiceRecommendationInput = {
  businessName: string
  industry: string
  city: string
  currentWebsiteUrl?: string
  businessGoal: string
  targetCustomers: string
  neededServices: string[]
  budgetRange: string
  preferredTimeline: string
  notes?: string
}

export type AiServiceRecommendationResult = {
  recommendedPackageName: string
  recommendedServices: string[]
  suggestedWebsiteStructure: string[]
  suggestedSeoKeywords: string[]
  estimatedPriority: string
  nextSteps: string[]
  explanation: string
}

export type AiServiceRecommendationRequestResult = {
  id: number
  companyId: number
  companyName: string
  customerEmail: string
  input: AiServiceRecommendationInput
  result: AiServiceRecommendationResult
  createdAt: string
}
