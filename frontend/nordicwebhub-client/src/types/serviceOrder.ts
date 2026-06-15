export type ServiceOrderStatus =
  | 'Pending'
  | 'Approved'
  | 'Paid'
  | 'Cancelled'

export type ServiceOrder = {
  id: number
  companyId: number
  companyName: string
  customerId: string
  customerEmail: string
  servicePackageId: number
  servicePackageName: string
  title: string
  notes: string
  amount: number
  status: ServiceOrderStatus
  paymentReference: string | null
  createdAt: string
  updatedAt: string
  paidAt: string | null
}

export type CreateServiceOrderDto = {
  servicePackageId: number
  title: string
  notes: string
  paymentReference?: string
}

export type UpdateServiceOrderStatusDto = {
  status: ServiceOrderStatus
}
