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
