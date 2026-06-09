export type ServicePackage = {
  id: number
  name: string
  description: string
  category: string
  monthlyPrice: number
  setupFee: number
  deliveryTime: string
  isActive: boolean
  createdAt: string
}

export type CreateServicePackageDto = {
  name: string
  description: string
  category: string
  monthlyPrice: number
  setupFee: number
  deliveryTime: string
  isActive: boolean
}

export type UpdateServicePackageDto = CreateServicePackageDto
