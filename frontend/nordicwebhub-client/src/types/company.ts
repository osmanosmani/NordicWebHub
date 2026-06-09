export type Company = {
  id: number
  name: string
  orgNumber: string
  websiteUrl: string
  city: string
  industry: string
  phone: string
  ownerId: string
  ownerEmail: string
  createdAt: string
}

export type CreateCompanyDto = {
  name: string
  orgNumber: string
  websiteUrl: string
  city: string
  industry: string
  phone: string
  ownerId: string
}

export type UpdateCompanyDto = {
  name: string
  orgNumber: string
  websiteUrl: string
  city: string
  industry: string
  phone: string
  ownerId?: string
}

export type UpdateMyCompanyDto = Pick<
  UpdateCompanyDto,
  'websiteUrl' | 'city' | 'industry' | 'phone'
>
